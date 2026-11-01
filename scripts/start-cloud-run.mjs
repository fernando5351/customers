import net from 'node:net';
import { spawn } from 'node:child_process';

const children = new Set();
let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  const timeout = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
    process.exit(code);
  }, 8000);
  if (!children.size) process.exit(code);
  timeout.unref();
  process.exitCode = code;
}

function start(name) {
  const child = spawn(process.execPath, [`dist/apps/${name}/main.js`], {
    env: process.env,
    stdio: 'inherit',
  });
  children.add(child);
  child.on('error', (error) => {
    console.error(`${name} could not start: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${name} exited: code=${code}, signal=${signal}`);
      stop(1);
    }
  });
}

async function waitForCustomers() {
  const deadline = Date.now() + 180_000;
  while (!stopping && Date.now() < deadline) {
    const ready = await new Promise((resolve) => {
      const socket = net.createConnection({
        host: process.env.TCP_HOST ?? '127.0.0.1',
        port: Number(process.env.CUSTOMERS_TCP_PORT ?? 3101),
      });
      const finish = (result) => { socket.destroy(); resolve(result); };
      socket.setTimeout(1000);
      socket.once('connect', () => finish(true));
      socket.once('error', () => finish(false));
      socket.once('timeout', () => finish(false));
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Customers did not become ready before the startup deadline');
}

process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));

try {
  start('customers-service');
  await waitForCustomers();
  if (!stopping) start('api-gateway');
} catch (error) {
  console.error(error.message);
  stop(1);
}
