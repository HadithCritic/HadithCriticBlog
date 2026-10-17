// Builds, tests and deploys Studio as an uploaded version.
//
// `wrangler deploy` also reconciles routes, which reads the zone's Worker routes.
// The account token cannot read those, so a plain deploy uploads the Worker and
// then fails. Uploading a version and deploying it by id changes only the code;
// the custom domain attached to the Worker stays as it is.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const wrangler = fileURLToPath(new URL('../../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const config = ['--config', 'studio/wrangler.toml'];

function run(args, { capture = false, cwd = root } = {}) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' });
  if (capture) process.stdout.write(result.stdout ?? '');
  if (result.status !== 0) throw new Error(`node ${args.join(' ')} exited with ${result.status}`);
  return result.stdout ?? '';
}

run(['scripts/build.mjs'], { cwd: fileURLToPath(new URL('../', import.meta.url)) });
run(['--test', 'studio/tests/*.test.mjs']);
const upload = run([wrangler, 'versions', 'upload', ...config], { capture: true });
const version = upload.match(/Worker Version ID:\s*([0-9a-f-]{36})/i)?.[1];
if (!version) throw new Error('The upload did not report a version id; nothing was deployed.');
run([wrangler, 'versions', 'deploy', `${version}@100%`, '--yes', ...config]);
console.log(`Studio version ${version} is serving 100% of requests.`);
