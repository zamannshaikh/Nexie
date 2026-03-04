use rust_socketio::{ClientBuilder, Payload, RawClient};
use serde_json::json;
use std::process::Command;
use tray_item::{IconSource, TrayItem};
use std::fs;
use directories::ProjectDirs;

fn main() {
    // 1. Locate the OS-specific persistent application data folder
    let proj_dirs = ProjectDirs::from("com", "Nexie", "NexieGateway")
        .expect("Could not find standard OS directories");
    let config_dir = proj_dirs.config_dir();
    let token_file_path = config_dir.join("token.txt");
    println!("🔍 Checking for token in: {}", token_file_path.display());

    // 2. Check persistent memory for the token
    let token = if token_file_path.exists() {
        println!("✅ Found existing token in persistent memory.");
        
        fs::read_to_string(&token_file_path).expect("Failed to read token file")
    } else {
        println!("⚠️ No token found. Prompting user...");
        
        // 3. Pop up a native OS input box if the token is missing
        let input = match tinyfiledialogs::input_box(
            "Nexie Gateway Setup",
            "Welcome to Nexie! Please paste your secure Gateway Token from the web dashboard:",
            ""
        ) {
            Some(t) => t,
            None => {
                println!("🛑 Setup cancelled by user.");
                std::process::exit(0); // Exit smoothly if they click "Cancel"
            }
        };

        let clean_input = input.trim();

        if clean_input.is_empty() {
            println!("🛑 No token provided. Exiting.");
            std::process::exit(0);
        }

        // 4. Save the new token to persistent memory for next time
        fs::create_dir_all(config_dir).expect("Failed to create Nexie config folder");
        fs::write(&token_file_path, clean_input).expect("Failed to save token to disk");
        
        println!("💾 Token saved securely for future launches.");
        clean_input.to_string()
    };

    let clean_token = token.trim();
    println!("🔑 Current Token: {}", clean_token);

    // 5. Connect to Socket.io using the loaded token
    let url = format!("http://localhost:5000?clientType=rust_gateway&token={}", clean_token);

    let on_command = |payload: Payload, socket: RawClient| {
        if let Payload::Text(values) = payload {
            if let Some(first_arg) = values.get(0) {
                if let Some(cmd_str) = first_arg.get("command").and_then(|v| v.as_str()) {
                    println!("🚀 Received command from Nexie: {}", cmd_str);

                    let output = Command::new("sh")
                        .arg("-c")
                        .arg(cmd_str)
                        .output();

                    let response = match output {
                        Ok(out) => {
                            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
                            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
                            format!("{}{}", stdout, stderr)
                        },
                        Err(e) => format!("Execution Error: {}", e),
                    };

                    println!("✅ Command finished. Sending output back to server.");
                    socket.emit("command_result", json!({ "output": response })).unwrap();
                }
            }
        }
    };

    // NEW: Define the shutdown behavior
    let on_shutdown = |_payload: Payload, _socket: RawClient| {
        println!("🛑 Remote shutdown signal received from Nexie dashboard.");
        println!("Shutting down the background process instantly...");
        std::process::exit(0);
    };

    // Attach BOTH listeners to your Socket connection
    let _socket = ClientBuilder::new(url)
        .on("execute_command", on_command)
        .on("shutdown_gateway", on_shutdown) 
        .connect()
        .expect("Failed to connect to Nexie Socket.io server");

    println!("🔗 Rust Gateway is running and connected to Nexie!");

    // 6. Set up the System Tray Icon
    let mut tray = TrayItem::new("Nexie Client", IconSource::Resource("")).unwrap();
    tray.add_label("Nexie Local Gateway").unwrap();

    let (tx, rx) = std::sync::mpsc::sync_channel(1);
    
    // Add "Reset Token" button
    let token_path_for_reset = token_file_path.clone();
    let tx_reset = tx.clone();

    tray.add_menu_item("Reset Token", move || {
        println!("🗑️ Deleting saved token...");
        if token_path_for_reset.exists() {
            let _ = fs::remove_file(&token_path_for_reset);
        }
        println!("🛑 Token cleared. Shutting down. Please restart the app.");
        tx_reset.send(()).unwrap();
    }).unwrap();

    // Add "Quit" button
    tray.add_menu_item("Quit Nexie", move || {
        println!("🛑 Shutting down Nexie Gateway...");
        tx.send(()).unwrap();
    }).unwrap();

    rx.recv().unwrap();
    std::process::exit(0);
}