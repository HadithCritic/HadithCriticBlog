# SilsilahResearch MVP

SilsilahResearch is a local-first desktop research and writing app for Islamic Studies. The current MVP is intentionally small: it opens a local project folder, edits Markdown drafts, manages local citations, renders hadith blocks, creates simple vertical isnad diagrams, and exports Markdown.

The researcher argues. The tool organizes, searches, cites, formats, diagrams, and exports.

## Current Location

The app lives inside this repository at:

```text
silsilah-research/
```

It is separate from the Astro blog. The blog page remains at `src/pages/silsilah-research.astro`; the desktop app source is under `silsilah-research/src` and `silsilah-research/src-tauri`.

## How To Open It

From a new terminal:

```powershell
cd C:\Users\Jonathan\Desktop\HadithCriticBlog\silsilah-research
pnpm tauri dev
```

That starts the Vite frontend at `http://127.0.0.1:1420` and opens the Tauri desktop window.

If a terminal does not recognize `cargo`, open a fresh terminal. Rust was installed through `rustup`, and the user PATH includes:

```text
C:\Users\Jonathan\.cargo\bin
```

For the browser-only development view:

```powershell
cd C:\Users\Jonathan\Desktop\HadithCriticBlog\silsilah-research
pnpm dev
```

Then open:

```text
http://127.0.0.1:1420
```

The browser view uses the sample vault fallback. The desktop Tauri window uses real local file access.

## Verified Local Tooling

Installed and verified on this machine:

```text
Rustup: 1.29.0
Rust toolchain: stable-x86_64-pc-windows-msvc
rustc: 1.96.0
cargo: 1.96.0
MSVC: Visual Studio Build Tools 2022
WebView2: 149.0.4022.69
Node: 22.22.1
pnpm: 10.33.0
```

Useful checks:

```powershell
rustup show active-toolchain
cargo --version
pnpm tauri info
pnpm tauri build --debug --no-bundle
```

The last command builds a debug desktop executable without packaging an installer.

## Stack

| Layer | Current choice | Purpose |
| :-- | :-- | :-- |
| Desktop shell | Tauri 2 | Native window, local file-system bridge, small footprint |
| Backend | Rust | Tauri commands and project-folder path safety |
| Frontend | React 19 + TypeScript | App shell, editor UI, panels, modals |
| Bundler | Vite | Development server and frontend build |
| Editor | CodeMirror 6 | Markdown editing with Arabic/English bidi support |
| Icons | lucide-react + Silsilah emblem | Standard UI icons plus local brand mark |
| Storage | Local folder | Project data lives as Markdown and JSON |
| Export | Markdown now | DOCX/PDF hooks are reserved for later Pandoc work |

## Project Structure

```text
silsilah-research/
  src-tauri/
    src/
      main.rs          Tauri bootstrap
      fs.rs            vault path safety and file listing
      commands.rs      open/read/write/create/export commands
    icons/
      icon.ico         Windows app icon

  src/
    app/
      App.tsx          main workspace state
    components/
      brand/           Silsilah logo component
      layout/          top bar, sidebar, research panel, app shell
      editor/          CodeMirror editor and Markdown preview
      files/           file tree and new-file modal
      citations/       citation panel and picker
      hadith/          hadith block renderer and insert modal
      isnad/           vertical chain editor/viewer
      ui/              shared buttons, tabs, modal, panel
    lib/               vault, Markdown, citation, export helpers
    styles/            HadithCritic/Silsilah globals and app CSS

  sample-vault/
    project.json
    citations.json
    drafts/
    notes/
    sources/
    diagrams/
    exports/
```

## Brand And Shared Components

The desktop app now reuses the Silsilah/HadithCritic identity instead of inventing a separate mark.

Shared identity sources:

- Website emblem source: `src/components/GeometricEmblem.astro`
- Desktop React port: `silsilah-research/src/components/brand/SilsilahLogo.tsx`
- Website globals: `src/styles/global.css`
- Desktop token mirror: `silsilah-research/src/styles/tokens.css`

The desktop app maps its `--sr-*` product UI tokens to the same underlying `--hc-*` vocabulary where appropriate:

```css
--hc-black
--hc-charcoal
--hc-gold
--hc-parchment
--hc-muted
--font-ui
--font-body
--font-arabic
```

Keep the app quieter than the marketing site. The desktop surface should feel like a writing tool, not a landing page: dark navigation, light document surface, compact controls, calm borders, and the Silsilah emblem as a small project mark.

## How To Use The App

### Open A Project

Click `Open Project` and choose a local folder.

If the folder does not already have the expected vault structure, Tauri creates the basic folders and `project.json`.

Expected vault shape:

```text
my-project/
  project.json
  drafts/
  notes/
  sources/
  citations/
  citations.json
  diagrams/
  exports/
```

### Create A Draft Or Note

Click `New File`.

Supported MVP file types:

```text
Draft: drafts/*.md
Note: notes/*.md
Isnad diagram: diagrams/*.isnad.json
```

Markdown files open in the editor. Isnad files open in the diagram editor.

### Write In Markdown

Markdown files are stored directly on disk. The editor uses CodeMirror 6 with Markdown highlighting and bidi-friendly text handling.

Save with:

```text
Ctrl+S
```

or the `Save` button.

The center workspace has three modes:

```text
Editor
Split
Preview
```

### Use Citations

Local citations are read from `citations.json`.

Example:

```json
[
  {
    "id": "motzki-2010-amt",
    "type": "book",
    "author": "Harald Motzki",
    "title": "Analysing Muslim Traditions",
    "publisher": "Brill",
    "year": 2010,
    "place": "Leiden"
  }
]
```

Insert syntax:

```md
[[cite:motzki-2010-amt]]
[[cite:motzki-2010-amt:210]]
```

The right panel `Citations` tab shows citations used in the current document and the local citation library.

### Insert A Hadith Block

Use:

```text
Insert > Hadith Block
```

Markdown syntax:

```md
:::hadith
id: bukhari-2487
collection: Sahih al-Bukhari
reference: Bukhari 2487
arabic: |
  حَدَّثَنَا مُحَمَّدُ بْنُ عَبْدِ اللَّهِ بْنِ الْمُثَنَّى...
english_isnad: |
  Narrated Muhammad ibn Abdullah ibn al-Muthanna, who said: my father narrated to me...
english_matn: |
  Abu Bakr, may God be pleased with him, wrote for him the zakat ordinance...
:::
```

Rules for source blocks:

- Preserve Arabic text exactly.
- Preserve the full English transmission wording.
- Do not collapse the English isnad into a short narrator label.
- Translate `الله` as `God`.
- Translate `رسول الله` as `the Messenger of God`.

The preview renders:

- Arabic source text
- English isnad in muted italic text
- English matn
- collection/reference line

### Create An Isnad Diagram

Open a `.isnad.json` file from `diagrams/`.

The MVP diagram model is a vertical chain:

```json
{
  "id": "diagram-001",
  "title": "Bukhari 2487 Chain",
  "nodes": [
    {
      "id": "muhammad-ibn-abdullah",
      "name": "Muhammad ibn Abdullah ibn al-Muthanna",
      "verb": "narrated to us"
    }
  ]
}
```

Available actions:

- Add node
- Remove node
- Edit narrator name
- Edit transmission verb
- Save JSON
- Export SVG

The `Insert Reference` button prepares the Markdown reference format for placing the diagram in a draft.

### Export Markdown

Open a Markdown draft and choose:

```text
Export > Markdown
```

In the browser fallback, this downloads the Markdown file.

In the Tauri desktop app, the command also writes a copy into the project `exports/` folder.

DOCX and PDF export are not implemented yet. The current code keeps those menu items visible as later hooks.

## Current MVP Status

Implemented:

- Local project folder open
- File sidebar
- Markdown editor
- Markdown preview
- Arabic/English text support through CodeMirror and CSS
- Citation list read from local JSON
- Citation insertion
- Hadith block insertion and preview rendering
- Isnad diagram editor
- SVG export for diagrams
- Markdown export
- Tauri file commands with project-relative path safety
- Silsilah/HadithCritic emblem and token alignment

Not implemented yet:

- Full text search
- PDF reader
- DOCX/PDF export through Pandoc
- Zotero import
- Narrator database
- Chain validation
- Corpus search
- AI features
- Cloud sync or accounts

## Common Commands

```powershell
cd C:\Users\Jonathan\Desktop\HadithCriticBlog\silsilah-research
pnpm install
pnpm dev
pnpm build
pnpm tauri info
pnpm tauri dev
pnpm tauri build --debug --no-bundle
```

## Troubleshooting

### `cargo` is not recognized

Open a new terminal. If this still fails:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo --version
```

### Port 1420 is already in use

Stop the old dev server or close the running Tauri dev session.

Check listeners:

```powershell
Get-NetTCPConnection -LocalPort 1420 -State Listen
```

### Tauri opens but files do not persist

Make sure you are using `pnpm tauri dev`, not only `pnpm dev`. The browser-only Vite view uses the sample vault fallback. The Tauri window uses real local files.

### Build warns about a large JavaScript chunk

That is expected for the MVP because CodeMirror ships in the main bundle. If it becomes a problem, split editor-related code with dynamic imports.

## Design Rule For Future Work

Build the ordinary workflow first:

```text
open folder -> create file -> write -> cite -> insert source block -> diagram if needed -> export
```

Specialized Islamic Studies features should appear through `Insert`, `Tools`, or focused file types. They should not become a wall of advanced panels on the first screen.
