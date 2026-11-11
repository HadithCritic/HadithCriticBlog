import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildArgs = process.argv.slice(2);
const outDirIndex = buildArgs.indexOf('--outDir');
const inlineOutDir = buildArgs.find((arg) => arg.startsWith('--outDir='));
if (outDirIndex >= 0 && (!buildArgs[outDirIndex + 1] || buildArgs[outDirIndex + 1].startsWith('--'))) {
  throw new Error('--outDir requires a directory');
}
if (inlineOutDir === '--outDir=') throw new Error('--outDir requires a directory');
const outputRoot = path.resolve(repoRoot, inlineOutDir?.slice('--outDir='.length)
  ?? (outDirIndex >= 0 ? buildArgs[outDirIndex + 1] : 'dist'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...options
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

run(process.execPath, [path.join(repoRoot, 'node_modules/astro/bin/astro.mjs'), 'build', ...buildArgs]);

run(process.execPath, [
  path.join(repoRoot, 'node_modules/pagefind/lib/runner/bin.cjs'),
  '--site',
  path.join(outputRoot, 'client')
]);
