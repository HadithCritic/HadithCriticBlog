#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const options = parseArgs(process.argv.slice(2));
if (options.scope && options.scope !== "corpus-coranicum-only") {
  throw new Error(`Unsupported --scope: ${options.scope}`);
}
if (options.scope === "corpus-coranicum-only" &&
    [options.nasser, options.studies, options.shamela].some(Boolean)) {
  throw new Error("--scope corpus-coranicum-only cannot include Nasser, Studies, or Shamela paths");
}

for (const key of ["tei"]) {
  if (!options[key]) throw new Error(`Missing required --${key} path`);
}

const definitions = [
  {
    id: "nasser-export",
    path: options.nasser ?? null,
    kind: "json-export",
    origin: "User-supplied local directory; upstream origin and export version not established",
    license: { status: "needs_review", terms: null },
    redistribution: "quarantined",
  },
  {
    id: "quran-studies-files",
    path: options.studies ?? null,
    kind: "bibliography-and-study-files",
    origin: "User-supplied local directory; per-file origin and redistribution rights not established",
    license: { status: "needs_review", terms: null },
    redistribution: "quarantined",
  },
  {
    id: "shamela-category-5-export",
    path: options.shamela ?? null,
    kind: "csv-book-text-export",
    origin: "User-supplied local file; upstream export URL/version not established",
    license: { status: "needs_review", terms: null },
    redistribution: "quarantined",
  },
  {
    id: "corpus-coranicum-tei",
    path: options.tei,
    kind: "tei-data-release",
    origin: "https://github.com/telota/corpus-coranicum-tei",
    license: {
      status: "identified",
      terms: "CC BY-SA 4.0 as stated in the upstream README; image rights must be checked separately",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    redistribution: "limited-to-reviewed-CC-BY-SA-data; no referenced media copied",
  },
];

const sources = [];
for (const definition of definitions) {
  if (definition.path === null) {
    const excludedByScope = options.scope === "corpus-coranicum-only" &&
      definition.id !== "corpus-coranicum-tei";
    sources.push({
      id: definition.id,
      kind: definition.kind,
      suppliedLocation: null,
      origin: definition.origin,
      commit: null,
      license: definition.license,
      redistribution: definition.redistribution,
      availability: excludedByScope ? "excluded_by_scope" : "not_supplied",
      ...(excludedByScope ? { scopeNote: "Excluded from the active Corpus Coranicum-only Quran goal." } : {}),
      fileCount: 0,
      totalBytes: 0,
      files: [],
    });
    continue;
  }

  const absolutePath = path.resolve(definition.path);
  let info;
  try {
    info = await stat(absolutePath);
  } catch (error) {
    if (definition.id !== "shamela-category-5-export" || error.code !== "ENOENT") throw error;
    sources.push({
      id: definition.id,
      kind: definition.kind,
      suppliedLocation: absolutePath,
      origin: definition.origin,
      commit: null,
      license: definition.license,
      redistribution: definition.redistribution,
      availability: "missing",
      fileCount: 0,
      totalBytes: 0,
      files: [],
    });
    continue;
  }
  const expectsDirectory = ["nasser-export", "quran-studies-files", "corpus-coranicum-tei"]
    .includes(definition.id);
  if (expectsDirectory && !info.isDirectory()) {
    throw new Error(`${definition.id} requires a directory: ${absolutePath}`);
  }
  if (definition.id === "shamela-category-5-export" && !info.isFile()) {
    throw new Error(`${definition.id} requires a file: ${absolutePath}`);
  }
  const files = info.isDirectory()
    ? await walkFiles(absolutePath)
    : [absolutePath];
  const fileRecords = [];
  for (const file of files) {
    const fileInfo = await stat(file);
    fileRecords.push({
      relativePath: info.isDirectory() ? path.relative(absolutePath, file).split(path.sep).join("/") : path.basename(file),
      bytes: fileInfo.size,
      sha256: await hashFile(file),
    });
  }

  const gitHead = info.isDirectory() ? gitHeadAt(absolutePath) : null;
  const acquisition = definition.id === "corpus-coranicum-tei"
    ? gitCloneAcquisition(absolutePath)
    : { acquiredAt: null, acquisitionTimeBasis: null };
  sources.push({
    id: definition.id,
    kind: definition.kind,
    suppliedLocation: absolutePath,
    origin: definition.origin,
    commit: gitHead,
    acquiredAt: acquisition.acquiredAt,
    acquisitionTimeBasis: acquisition.acquisitionTimeBasis,
    license: definition.license,
    redistribution: definition.redistribution,
    availability: "present",
    fileCount: fileRecords.length,
    totalBytes: fileRecords.reduce((total, file) => total + file.bytes, 0),
    files: fileRecords,
  });
}

const manifest = {
  manifestVersion: options.scope === "corpus-coranicum-only" ? 3 : 2,
  ...(options.scope ? { scope: options.scope } : {}),
  createdAt: new Date().toISOString(),
  generatedBy: "scripts/quran/build-source-manifest.mjs",
  applicationCommit: gitHeadAt(root),
  sources,
};

const outputPath = path.resolve(options.out ?? path.join(root, "scratch/quran/source-manifest.local.json"));
await (await import("node:fs/promises")).mkdir(path.dirname(outputPath), { recursive: true });
await (await import("node:fs/promises")).writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: outputPath, sources: sources.map(({ id, commit, fileCount, totalBytes, license, redistribution, availability }) => ({ id, commit, fileCount, totalBytes, license: license.status, redistribution, availability })) }, null, 2));

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key.startsWith("--")) throw new Error(`Unexpected argument: ${key}`);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    parsed[key.slice(2)] = value;
    index += 1;
  }
  return parsed;
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    if (entry.isDirectory() && entry.name === ".git") continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(absolutePath)));
    else if (entry.isFile()) files.push(absolutePath);
  }
  return files.sort((a, b) => path.relative(directory, a).localeCompare(path.relative(directory, b), "en"));
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function gitHeadAt(directory) {
  const result = spawnSync("git", ["-C", directory, "rev-parse", "HEAD"], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function gitCloneAcquisition(directory) {
  const result = spawnSync(
    "git",
    ["-C", directory, "reflog", "--date=iso-strict", "--format=%gd%x09%gs", "--all"],
    { encoding: "utf8" },
  );
  if (result.status !== 0) return { acquiredAt: null, acquisitionTimeBasis: null };
  for (const line of result.stdout.split(/\r?\n/)) {
    const match = line.match(/^[^@]+@\{([^}]+)}\tclone: from (.+)$/);
    if (!match) continue;
    const timestamp = new Date(match[1]);
    if (Number.isNaN(timestamp.valueOf())) continue;
    return {
      acquiredAt: timestamp.toISOString(),
      acquisitionTimeBasis: `Git reflog clone entry: ${match[2]}`,
    };
  }
  return { acquiredAt: null, acquisitionTimeBasis: null };
}
