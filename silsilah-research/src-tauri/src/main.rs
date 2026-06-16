mod commands;
mod fs;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(fs::VaultState::default())
        .invoke_handler(tauri::generate_handler![
            commands::open_project_folder,
            commands::list_files,
            commands::read_file,
            commands::write_file,
            commands::create_file,
            commands::create_folder,
            commands::export_markdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running SilsilahResearch");
}
