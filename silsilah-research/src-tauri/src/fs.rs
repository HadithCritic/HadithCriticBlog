use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Component, Path, PathBuf},
    sync::Mutex,
};

#[derive(Default)]
pub struct VaultState {
    root: Mutex<Option<PathBuf>>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfo {
    pub name: String,
    pub created_at: String,
    pub version: String,
}

#[derive(Serialize)]
pub struct ProjectSnapshot {
    pub project: ProjectInfo,
    pub files: Vec<FileEntry>,
}

#[derive(Serialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub kind: String,
    pub extension: Option<String>,
}

impl VaultState {
    pub fn set_root(&self, root: PathBuf) -> Result<(), String> {
        let mut guard = self.root.lock().map_err(|_| "Project state is unavailable.".to_string())?;
        *guard = Some(root);
        Ok(())
    }

    pub fn root(&self) -> Result<PathBuf, String> {
        let guard = self.root.lock().map_err(|_| "Project state is unavailable.".to_string())?;
        guard
            .clone()
            .ok_or_else(|| "Open a project folder first.".to_string())
    }
}

pub fn initialize_vault(root: &Path) -> Result<ProjectInfo, String> {
    fs::create_dir_all(root.join("drafts")).map_err(string_error)?;
    fs::create_dir_all(root.join("notes")).map_err(string_error)?;
    fs::create_dir_all(root.join("sources")).map_err(string_error)?;
    fs::create_dir_all(root.join("citations")).map_err(string_error)?;
    fs::create_dir_all(root.join("diagrams")).map_err(string_error)?;
    fs::create_dir_all(root.join("exports")).map_err(string_error)?;

    let project_path = root.join("project.json");
    if !project_path.exists() {
        let name = root
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Research Project")
            .to_string();
        let project = ProjectInfo {
            name,
            created_at: chrono::Local::now().format("%Y-%m-%d").to_string(),
            version: "0.1.0".to_string(),
        };
        let contents = serde_json::to_string_pretty(&project).map_err(string_error)?;
        fs::write(&project_path, contents).map_err(string_error)?;
        return Ok(project);
    }

    let contents = fs::read_to_string(project_path).map_err(string_error)?;
    serde_json::from_str(&contents).map_err(string_error)
}

pub fn list_vault_files(root: &Path) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();
    visit(root, root, &mut entries)?;
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(entries)
}

pub fn resolve_existing(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let path = resolve_safe(root, relative)?;
    let canonical = path.canonicalize().map_err(string_error)?;
    let canonical_root = root.canonicalize().map_err(string_error)?;
    if !canonical.starts_with(canonical_root) {
        return Err("Path is outside the open project.".to_string());
    }
    Ok(canonical)
}

pub fn resolve_safe(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let relative_path = Path::new(relative);
    if relative_path.is_absolute() {
        return Err("Absolute paths are not allowed inside a vault command.".to_string());
    }

    for component in relative_path.components() {
        match component {
            Component::Normal(_) => {}
            _ => return Err("Only project-relative paths are allowed.".to_string()),
        }
    }

    Ok(root.join(relative_path))
}

fn visit(root: &Path, directory: &Path, entries: &mut Vec<FileEntry>) -> Result<(), String> {
    for entry in fs::read_dir(directory).map_err(string_error)? {
        let entry = entry.map_err(string_error)?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') {
            continue;
        }

        let relative = path
            .strip_prefix(root)
            .map_err(string_error)?
            .to_string_lossy()
            .replace('\\', "/");

        if path.is_dir() {
            entries.push(FileEntry {
                path: relative,
                name,
                kind: "directory".to_string(),
                extension: None,
            });
            visit(root, &path, entries)?;
        } else if is_supported_file(&path) {
            entries.push(FileEntry {
                path: relative,
                name,
                kind: "file".to_string(),
                extension: extension_for(&path),
            });
        }
    }

    Ok(())
}

fn is_supported_file(path: &Path) -> bool {
    let name = path.file_name().and_then(|value| value.to_str()).unwrap_or_default();
    name.ends_with(".md") || name.ends_with(".json")
}

fn extension_for(path: &Path) -> Option<String> {
    let name = path.file_name().and_then(|value| value.to_str())?;
    if name.ends_with(".isnad.json") {
        Some(".isnad.json".to_string())
    } else {
        path.extension()
            .and_then(|value| value.to_str())
            .map(|value| format!(".{value}"))
    }
}

pub fn string_error(error: impl std::fmt::Display) -> String {
    error.to_string()
}
