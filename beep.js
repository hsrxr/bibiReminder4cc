#!/usr/bin/env node
const { execSync } = require('child_process');

const MODE = process.argv[2] || 'done';

const PATTERNS = {
  done: [
    { freq: 1200, duration: 150, gap: 120 },
    { freq: 1500, duration: 150, gap: 0 },
  ],
  allow: [
    { freq: 600, duration: 200, gap: 120 },
    { freq: 500, duration: 200, gap: 0 },
  ],
};

function beepWin(beeps) {
  const psScript = beeps
    .map((b, i) => {
      const cmd = `[Console]::Beep(${b.freq}, ${b.duration})`;
      return i < beeps.length - 1 && b.gap > 0
        ? `${cmd}; Start-Sleep -m ${b.gap}`
        : cmd;
    })
    .join('; ');
  execSync(
    `powershell -NoProfile -NonInteractive -Command "${psScript.replace(/"/g, '\\"')}"`,
    { stdio: 'ignore', timeout: 5000 }
  );
}

function beepMac(beeps) {
  execSync(`osascript -e "beep ${beeps.length}"`, {
    stdio: 'ignore',
    timeout: 5000,
  });
}

function beepFallback(beeps) {
  for (const b of beeps) {
    process.stdout.write('\x07');
    if (b.gap > 0) sleepSync(b.gap);
  }
}

function sleepSync(ms) {
  execSync(
    process.platform === 'win32'
      ? `powershell -NoProfile -NonInteractive -Command "Start-Sleep -m ${ms}"`
      : `sleep ${(ms / 1000).toFixed(2)}`,
    { stdio: 'ignore', timeout: 60000 }
  );
}

function run(patternLabel) {
  const beeps = PATTERNS[patternLabel];
  if (!beeps) return;

  try {
    const platform = process.platform;
    if (platform === 'win32') {
      beepWin(beeps);
    } else if (platform === 'darwin') {
      beepMac(beeps);
    } else {
      beepFallback(beeps);
    }
  } catch {
    try {
      beepFallback(beeps);
    } catch {}
  }
}

if (MODE === '--test') {
  console.log('bibiReminder4cc — testing done pattern...');
  run('done');
  sleepSync(800);
  console.log('bibiReminder4cc — testing allow pattern...');
  run('allow');
  console.log('Test complete.');
} else if (MODE === 'done' || MODE === 'allow') {
  run(MODE);
} else {
  console.error('Usage: node beep.js <done|allow|--test>');
  process.exit(1);
}
