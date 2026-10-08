import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// NODE_OPTIONS also reaches Astro's detached dev process, unlike Node CLI flags.
// Keep an explicitly configured heap limit; otherwise allow 4 GiB for compiling
// the research data and MDX instead of the roughly 2 GiB default on this machine.
const nodeOptions = process.env.NODE_OPTIONS ?? '';
const hasHeapLimit = /(?:^|\s)--max[-_]old[-_]space[-_]size(?:=|\s|$)/.test(nodeOptions);
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)),
  'dev',
  '--host', '127.0.0.1',
  ...process.argv.slice(2)
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: hasHeapLimit ? nodeOptions : `${nodeOptions} --max-old-space-size=4096`.trim()
  }
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
