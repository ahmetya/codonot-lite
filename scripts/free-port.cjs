const { spawnSync } = require("node:child_process");

const port = Number(process.argv[2]);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Usage: node scripts/free-port.cjs <port>");
  process.exit(1);
}

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
  });
}

function getWindowsPids() {
  const result = run("netstat.exe", ["-ano", "-p", "tcp"]);
  const pids = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter(
      (columns) =>
        columns.length >= 5 &&
        columns[0] === "TCP" &&
        columns[1].endsWith(`:${port}`) &&
        columns[3] === "LISTENING"
    )
    .map((columns) => Number(columns[4]))
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(pids)];
}

function getUnixPids() {
  const result = run("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"]);

  return result.stdout
    .split(/\r?\n/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

const getPids = process.platform === "win32" ? getWindowsPids : getUnixPids;
let stoppedProcess = false;

for (let attempt = 0; attempt < 5; attempt += 1) {
  const pids = getPids();
  if (!pids.length) {
    console.log(
      stoppedProcess
        ? `Port ${port} has been released.`
        : `Port ${port} is available.`
    );
    process.exit(0);
  }

  for (const pid of pids) {
    stoppedProcess = true;
    console.log(`Stopping process ${pid} on port ${port}...`);

    if (process.platform === "win32") {
      const result = run("taskkill.exe", ["/PID", String(pid), "/T", "/F"]);
      if (result.status !== 0) {
        console.error(result.stderr.trim() || `Unable to stop process ${pid}.`);
        process.exit(1);
      }
    } else {
      try {
        process.kill(pid, "SIGTERM");
      } catch (error) {
        console.error(`Unable to stop process ${pid}:`, error.message);
        process.exit(1);
      }
    }
  }

  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
}

console.error(`Port ${port} is still occupied after repeated cleanup attempts.`);
process.exit(1);
