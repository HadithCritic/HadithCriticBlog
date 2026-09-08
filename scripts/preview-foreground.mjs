/**
 * Foreground wrapper around `astro preview`, for Playwright's `webServer`.
 *
 * `astro preview` starts a *background* server and returns immediately. That
 * breaks Playwright's contract, which expects the command to stay alive for as
 * long as the server should. On a machine where nothing is listening yet (CI,
 * or any clean checkout) Playwright ran the command, saw it exit, and reported
 * "Process from config.webServer exited early" before a single test ran.
 * `reuseExistingServer` does not save it, because that only applies when the
 * port already answers *before* the command runs.
 *
 * So this starts (or adopts) the server, waits for it to answer, then blocks
 * until Playwright terminates it, stopping the server on the way out only if
 * it was the one that started it. Adopting rather than restarting keeps a
 * developer's already-running `npm run preview` usable.
 */

import { spawn } from 'node:child_process';

const HOST = process.env.PREVIEW_HOST ?? '127.0.0.1';
const PORT = process.env.PREVIEW_PORT ?? '4321';
const URL_ = `http://${HOST}:${PORT}/`;
const READY_TIMEOUT_MS = 60_000;

const responds = async () => {
  try {
    // A 404 still proves a server is listening, which is all we need.
    await fetch(URL_, { signal: AbortSignal.timeout(2_000) });
    return true;
  } catch {
    return false;
  }
};

const astro = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['./node_modules/astro/bin/astro.mjs', ...args],
      { stdio: 'inherit' }
    );
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`astro ${args.join(' ')} exited ${code}`))
    );
  });

const adopted = await responds();

if (adopted) {
  console.log(`[preview] adopting the server already answering at ${URL_}`);
} else {
  await astro(['preview', '--background', '--host', HOST, '--port', PORT]);

  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (!(await responds())) {
    if (Date.now() > deadline) {
      await astro(['preview', 'stop']).catch(() => {});
      throw new Error(`preview server did not answer at ${URL_} within ${READY_TIMEOUT_MS}ms`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`[preview] ready at ${URL_}`);
}

let closing = false;
const shutdown = async (signal) => {
  if (closing) return;
  closing = true;
  // Leave a server we merely borrowed running; the developer still wants it.
  if (!adopted) await astro(['preview', 'stop']).catch(() => {});
  process.exit(signal === 'SIGTERM' || signal === 'SIGINT' ? 0 : 1);
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => void shutdown(signal));
}

// Block. Playwright signals this process when the run finishes.
await new Promise(() => {});
