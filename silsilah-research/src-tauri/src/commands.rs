use crate::fs::{
    initialize_vault, list_vault_files, resolve_existing, resolve_safe, string_error, ProjectSnapshot, VaultState,
};
use std::fs;
use tauri::State;

#[tauri::command]
pub fn open_project_folder(path: String, state: State<VaultState>) -> Result<ProjectSnapshot, String> {
    let root = std::path::PathBuf::from(path).canonicalize().map_err(string_error)?;
    if !root.is_dir() {
        return Err("Selected path is not a folder.".to_string());
    }

    let project = initialize_vault(&root)?;
    state.set_root(root.clone())?;
    let files = list_vault_files(&root)?;
    Ok(ProjectSnapshot { project, files })
}

#[tauri::command]
pub fn list_files(state: State<VaultState>) -> Result<Vec<crate::fs::FileEntry>, String> {
    let root = state.root()?;
    list_vault_files(&root)
}

#[tauri::command]
pub fn read_file(path: String, state: State<VaultState>) -> Result<String, String> {
    let root = state.root()?;
    let target = resolve_existing(&root, &path)?;
    fs::read_to_string(target).map_err(string_error)
}

#[tauri::command]
pub fn write_file(path: String, contents: String, state: State<VaultState>) -> Result<(), String> {
    let root = state.root()?;
    let target = resolve_safe(&root, &path)?;
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(string_error)?;
    }
    fs::write(target, contents).map_err(string_error)
}

#[tauri::command]
pub fn create_file(path: String, contents: String, state: State<VaultState>) -> Result<(), String> {
    let root = state.root()?;
    let target = resolve_safe(&root, &path)?;
    if target.exists() {
        return Err("A file already exists at that path.".to_string());
    }
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(string_error)?;
    }
    fs::write(target, contents).map_err(string_error)
}

#[tauri::command]
pub fn create_folder(path: String, state: State<VaultState>) -> Result<(), String> {
    let root = state.root()?;
    let target = resolve_safe(&root, &path)?;
    fs::create_dir_all(target).map_err(string_error)
}

#[tauri::command]
pub fn export_markdown(path: String, state: State<VaultState>) -> Result<String, String> {
    let root = state.root()?;
    let source = resolve_existing(&root, &path)?;
    let name = source
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Unable to read file name.".to_string())?;

    if !name.ends_with(".md") {
        return Err("Only Markdown files can be exported in the MVP.".to_string());
    }

    let contents = fs::read_to_string(&source).map_err(string_error)?;
    let exports = root.join("exports");
    fs::create_dir_all(&exports).map_err(string_error)?;
    fs::write(exports.join(name), &contents).map_err(string_error)?;
    Ok(contents)
}
