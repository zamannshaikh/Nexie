use rust_socketio::{ClientBuilder, Payload, RawClient};
use serde_json::{Value, json};
use std::process::Command;
use tray_item::{IconSource, TrayItem};

fn main() {
    // 1. Define what happens when Nexie sends a command
    let on_command = |payload: Payload, socket: RawClient| {
        if let Payload::String(text) = payload {
            if let Ok(parsed) = serde_json::from_str::<Value>(&text) {
                if let Some(cmd_str) = parsed["command"].as_str() {
                    
                    // Execute the shell command
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

                    // Emit the result back to Nexie
                    socket.emit("command_result", json!({ "output": response })).unwrap();
                }
            }
        }
    };

    // 2. Connect to your Socket.io server
    let _socket = ClientBuilder::new("http://localhost:5000")
        .on("execute_command", on_command)
        .connect()
        .expect("Failed to connect to Nexie Socket.io server");

    // 3. Set up the System Tray Icon
    let mut tray = TrayItem::new("Nexie Client", IconSource::Resource("")).unwrap();
    tray.add_label("Nexie Local Gateway").unwrap();

    let (tx, rx) = std::sync::mpsc::sync_channel(1);
    
    tray.add_menu_item("Quit Nexie", move || {
        tx.send(()).unwrap();
    }).unwrap();

    // Keep app running until Quit is clicked
    rx.recv().unwrap();
    std::process::exit(0);
}