use rust_socketio::{ClientBuilder, Payload, RawClient};
use serde_json::json;
use std::process::Command;
use tray_item::{IconSource, TrayItem};

fn main() {
    // 1. Define what happens when Nexie sends a command
    let on_command = |payload: Payload, socket: RawClient| {
        // In rust-socketio 0.6.0+, event arguments come as an array of JSON values (Payload::Text)
        if let Payload::Text(values) = payload {
            // Grab the first argument sent by Node.js
            if let Some(first_arg) = values.get(0) {
                // Extract the "command" string from the JSON object
                if let Some(cmd_str) = first_arg.get("command").and_then(|v| v.as_str()) {
                    
                    println!("🚀 Received command from Nexie: {}", cmd_str);

                    // Execute the shell command natively
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

                    // Emit the result back to Nexie
                    socket.emit("command_result", json!({ "output": response })).unwrap();
                } else {
                    println!("⚠️ Could not find 'command' property in: {}", first_arg);
                }
            }
        }
    };

    // 2. Connect to your Socket.io server
    let _socket = ClientBuilder::new("http://localhost:5000?clientType=rust_gateway")
        .on("execute_command", on_command)
        .connect()
        .expect("Failed to connect to Nexie Socket.io server");

    println!("🔗 Rust Gateway is running and connected to Nexie!");

    // 3. Set up the System Tray Icon
    let mut tray = TrayItem::new("Nexie Client", IconSource::Resource("")).unwrap();
    tray.add_label("Nexie Local Gateway").unwrap();

    let (tx, rx) = std::sync::mpsc::sync_channel(1);
    
    tray.add_menu_item("Quit Nexie", move || {
        println!("🛑 Shutting down Nexie Gateway...");
        tx.send(()).unwrap();
    }).unwrap();

    // Keep app running until Quit is clicked
    rx.recv().unwrap();
    std::process::exit(0);
}