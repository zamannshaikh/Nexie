extern crate winres;

fn main() {
    if cfg!(target_os = "windows") {
        let mut res = winres::WindowsResource::new();
        // We attach the icon and give it the specific ID "nexie-logo"
        res.set_icon_with_id("icon.ico", "nexie-logo");
        res.compile().expect("Failed to attach the Windows icon!");
    }
}