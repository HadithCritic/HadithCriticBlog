/**
 * Foreground wrapper around `astro preview`, for Playwright's `webServer`.
 *
 * `astro preview` starts a *background* server and returns immediately when run
 * under certain CLI conditions / agent environments. That breaks Playwright's contract,
 * which expects the webServer command to stay alive for as long as the server should run.
 *
 * This wrapper starts (or adopts) the server, waits for it to answer, and maintains
 * an active keep-alive and health check loop until Playwright terminates it.
 * Maintaining an active event-loop timer also prevents Node.js 22+ from terminating
 * with exit code 13 ("Unfinished Top-Level Await").
 *
 * On termination (SIGINT, SIGTERM, etc.), it cleans up the server only if it started it,
 * leaving an already-running developer server untouched.
 */

import { spawn } from 'node:child_process';

const HOST = process.env.PREVIEW_HOST ?? '127.0.0.1';
const PORT = process.env.PREVIEW_PORT ?? '4321';
const URL_ = `http://${HOST}:${PORT}/`;
const READY_TIMEOUT_MS = 60_000;

/**
 * `fetch` with a deadline, leaving nothing behind.
 *
 * `AbortSignal.timeout()` would be shorter, but its timer stays registered
 * until it fires, and exiting the process while one is pending trips a libuv
 * assertion on Windows that turns a deliberate `exit(1)` into exit 127. The
 * body is drained and the connection closed for the same reason: a socket left
 * in the keep-alive pool is another handle open at exit.
 */
const getWithDeadline = async (ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(URL_, {
      headers: { connection: 'close' },
      signal: controller.signal
    });
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const responds = async () => {
  try {
    // A 404 still proves a server is listening, which is all we need.
    await getWithDeadline(2_000);
    return true;
  } catch {
    return false;
  }
};

/**
 * Whether whatever is answering on this port is `astro dev` rather than the
 * built site.
 *
 * Playwright adopts an existing server, and a dev server answers on the same
 * port. Adopting one turns the whole end-to-end suite into a test of the source
 * tree: it serves src/ rather than dist/, so `PUBLIC_CORPUS_BASE_URL` baked in
 * by scripts/build-for-e2e.mjs is not there, the corpus is requested from the
 * site's own origin, and every corpus test fails on a 404 that looks like a
 * corpus problem. That cost a full 7.5 minute run to diagnose.
 *
 * The dev server injects Vite's client into every HTML response and the built
 * site never does, so one GET separates them.
 */
const isDevServer = async () => {
  try {
    return (await getWithDeadline(5_000)).includes('/@vite/client');
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
    child.on('error', (err) => {
      console.error(`[preview] Failed to spawn astro ${args.join(' ')}:`, err);
      reject(err);
    });
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        const msg = `astro ${args.join(' ')} exited with code ${code} and signal ${signal}`;
        console.error(`[preview] ${msg}`);
        reject(new Error(msg));
      }
    });
  });

let adopted = false;
try {
  adopted = await responds();
} catch (err) {
  console.warn(`[preview] Initial connectivity check failed:`, err);
}

/**
 * Set instead of calling `process.exit(1)`: exiting the process outright after
 * a `fetch` trips a libuv assertion on Windows and reports 127 rather than the
 * failure this is trying to report. Setting the code and declining to open the
 * keep-alive handles below lets the loop drain and exit 1 on its own.
 */
let bail = false;

if (adopted) {
  if (await isDevServer()) {
    console.error(`[preview] A dev server is answering at ${URL_}, not the built site.`);
    console.error('[preview] These tests run against a build. Stop `npm run dev`, then');
    console.error('[preview] rebuild with `npm run build:e2e` and run them again.');
    process.exitCode = 1;
    bail = true;
  } else {
    console.log(`[preview] Adopting the server already answering at ${URL_}`);
  }
} else {
  try {
    await astro(['preview', '--background', '--host', HOST, '--port', PORT]);
  } catch (err) {
    console.error(`[preview] Failed to launch preview server:`, err);
    process.exit(1);
  }

  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (!(await responds())) {
    if (Date.now() > deadline) {
      console.error(`[preview] Preview server did not answer at ${URL_} within ${READY_TIMEOUT_MS}ms`);
      await astro(['preview', 'stop']).catch(() => {});
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`[preview] Ready at ${URL_}`);
}

let closing = false;
let monitorInterval = null;

const shutdown = async (signal) => {
  if (closing) return;
  closing = true;

  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }

  console.log(`[preview] Received ${signal}, shutting down...`);

  // Leave a server we merely borrowed running; the developer still wants it.
  if (!adopted) {
    try {
      await astro(['preview', 'stop']);
    } catch (err) {
      console.warn(`[preview] Note: failed to cleanly stop preview server on exit:`, err?.message ?? err);
    }
  }

  process.exit(signal === 'SIGTERM' || signal === 'SIGINT' || signal === 'STDIN_END' ? 0 : 1);
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => void shutdown(signal));
}

if (!bail) {
  // Keep the event loop actively alive and periodically verify server health.
  // This prevents Node.js 22+ exit code 13 ("Unfinished Top-Level Await") and
  // immediately reports if the server terminates during test execution.
  monitorInterval = setInterval(async () => {
    if (closing) return;
    const alive = await responds();
    if (!alive && !closing) {
      console.error(`[preview] Server at ${URL_} stopped responding unexpectedly.`);
      await shutdown('SERVER_DOWN');
    }
  }, 2_000);

  // Also handle stdin closure from parent runner (e.g. Playwright)
  if (process.stdin.isTTY === false) {
    process.stdin.on('end', () => void shutdown('STDIN_END'));
    process.stdin.resume();
  }

  // Block awaiting signals or process termination
  await new Promise((resolve) => {
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
      process.on(signal, resolve);
    }
  });
}
