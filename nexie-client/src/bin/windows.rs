// 🔥 This line hides the black Command Prompt window! 🔥
#![windows_subsystem = "windows"]
use std::env::consts::OS;
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

    // 2. Check persistent memory for the token
    let token = if token_file_path.exists() {
        fs::read_to_string(&token_file_path).expect("Failed to read token file")
    } else {
        // 3. Pop up a native OS input box
        let input = match tinyfiledialogs::input_box(
            "Nexie Gateway Setup",
            "Welcome to Nexie! Please paste your secure Gateway Token from the web dashboard:",
            ""
        ) {
            Some(t) => t,
            None => {
                std::process::exit(0); 
            }
        };

        let clean_input = input.trim();

        if clean_input.is_empty() {
            std::process::exit(0);
        }

        // 4. Save the new token to persistent memory
        fs::create_dir_all(config_dir).expect("Failed to create Nexie config folder");
        fs::write(&token_file_path, clean_input).expect("Failed to save token to disk");
        clean_input.to_string()
    };

    let clean_token = token.trim();

    // 5. Connect to Socket.io using the loaded token
    let url = format!("https://nexie.in?clientType=rust_gateway&token={}&os={}", clean_token, OS);

    let on_command = |payload: Payload, socket: RawClient| {
        if let Payload::Text(values) = payload {
            if let Some(first_arg) = values.get(0) {
                if let Some(cmd_str) = first_arg.get("command").and_then(|v| v.as_str()) {
                    
                    // 🔥 The Trojan Horse Intercept 🔥
                    if cmd_str == "NEXIE_SHUTDOWN_SIGNAL" {
                        std::process::exit(0); 
                    }

                    // 🔥 WINDOWS-SPECIFIC FIX: Use cmd /C 🔥
                    let output = Command::new("cmd")
                        .arg("/C")
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

                    socket.emit("command_result", json!({ "output": response })).unwrap();
                }
            }
        }
    };

    // Attach listener to Socket connection
    let _socket = ClientBuilder::new(url)
        .on("execute_command", on_command)  
        .connect()
        .expect("Failed to connect to Nexie Socket.io server");

    // 6. Set up the System Tray Icon
    // 🔥 We link it to the "nexie-logo" ID we created in build.rs 🔥
    let mut tray = TrayItem::new("Nexie Gateway", IconSource::Resource("nexie-logo")).unwrap();
    
    let (tx, rx) = std::sync::mpsc::sync_channel(1);
    
    // Add "Reset Token" button
    let token_path_for_reset = token_file_path.clone();
    let tx_reset = tx.clone();

    tray.add_menu_item("Reset Token", move || {
        if token_path_for_reset.exists() {
            let _ = fs::remove_file(&token_path_for_reset);
        }
        tx_reset.send(()).unwrap();
    }).unwrap();

    // Add "Quit" button
    tray.add_menu_item("Quit Nexie", move || {
        tx.send(()).unwrap();
    }).unwrap();

    // Keep the app alive until a tray button is clicked
    rx.recv().unwrap();
    std::process::exit(0);
}