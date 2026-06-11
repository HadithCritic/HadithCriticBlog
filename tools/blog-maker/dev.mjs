import { spawn } from 'node:child_process';
import net from 'node:net';
import readline from 'node:readline';

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const children = [];
const host = '127.0.0.1';

function run(label, command, args, env = {}) {
  const useCmdShim = isWindows && command.endsWith('.cmd');
  const child = spawn(useCmdShim ? 'cmd.exe' : command, useCmdShim ? ['/d', '/s', '/c', command, ...args] : args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.push(child);
  prefix(child.stdout, label);
  prefix(child.stderr, label);

  child.on('exit', (code) => {
    if (code && !shuttingDown) {
      console.log(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });
}

function prefix(stream, label) {
  const reader = readline.createInterface({ input: stream });
  reader.on('line', (line) => console.log(`[${label}] ${line}`));
}

let shuttingDown = false;
function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = code;
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const astroPort = await findOpenPort(Number(process.env.BLOG_MAKER_ASTRO_PORT || 4321));
const apiPort = await findOpenPort(Number(process.env.BLOG_MAKER_PORT || 8787));
const editorPort = await findOpenPort(Number(process.env.BLOG_MAKER_EDITOR_PORT || 5173));
const astroOrigin = `http://${host}:${astroPort}`;
const apiOrigin = `http://${host}:${apiPort}`;
const editorOrigin = `http://${host}:${editorPort}`;

run('astro', npm, ['run', 'dev', '--', '--host', host, '--port', String(astroPort)], {
  BLOG_MAKER_PREVIEW: 'true',
});
run('api', 'node', ['tools/blog-maker/server.mjs'], {
  BLOG_MAKER_PORT: String(apiPort),
  BLOG_MAKER_ASTRO_ORIGIN: astroOrigin,
  BLOG_MAKER_EDITOR_ORIGIN: editorOrigin,
});
run('editor', npm, ['run', 'author:ui', '--', '--port', String(editorPort)], {
  BLOG_MAKER_API_ORIGIN: apiOrigin,
  BLOG_MAKER_EDITOR_PORT: String(editorPort),
});

console.log('Blog Maker starting:');
console.log(`  Editor: ${editorOrigin}`);
console.log(`  Site:   ${astroOrigin}`);

async function findOpenPort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await canListen(port)) return port;
  }
  throw new Error(`No open port found from ${startPort} to ${startPort + 19}`);
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}
