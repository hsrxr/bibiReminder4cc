#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const isGlobal = process.argv.includes('--global');

function eprintf(...args) {
  process.stderr.write(args.join(' ') + '\n');
}

function getPaths() {
  if (isGlobal) {
    const home = os.homedir();
    const claudeDir = path.join(home, '.claude');
    return {
      claudeDir,
      hooksDir: path.join(claudeDir, 'hooks'),
      settingsFile: path.join(claudeDir, 'settings.local.json'),
      hooksDirRel: path.join(claudeDir, 'hooks'),
    };
  }
  const cwd = process.cwd();
  return {
    claudeDir: path.join(cwd, '.claude'),
    hooksDir: path.join(cwd, '.claude', 'hooks'),
    settingsFile: path.join(cwd, '.claude', 'settings.local.json'),
    hooksDirRel: path.join('.claude', 'hooks'),
  };
}

function getHookCommand(hooksDir, pattern) {
  const normalize = (p) => p.split(path.sep).join('/');
  if (isGlobal) {
    const scriptPath = normalize(path.join(hooksDir, 'beep.js'));
    return `node "${scriptPath}" ${pattern}`;
  }
  return `node ".claude/hooks/beep.js" ${pattern}`;
}

function readSettings(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    eprintf('Error: failed to parse', file);
    eprintf('Backing up to', file + '.bak');
    try {
      fs.copyFileSync(file, file + '.bak');
    } catch {}
    eprintf(err.message);
    process.exit(1);
  }
}

function addHook(settings, event, command) {
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks[event])) settings.hooks[event] = [];

  if (
    settings.hooks[event].some(
      (entry) =>
        entry.matcher === '*' &&
        Array.isArray(entry.hooks) &&
        entry.hooks.some(
          (h) => h.type === 'command' && h.command === command
        )
    )
  ) {
    return false;
  }

  // Try to find an existing "*" matcher entry to append to
  const wildcard = settings.hooks[event].find(
    (e) => e.matcher === '*'
  );
  if (wildcard) {
    if (
      !wildcard.hooks.some((h) => h.type === 'command' && h.command === command)
    ) {
      wildcard.hooks.push({ type: 'command', command });
    }
    return false;
  }

  settings.hooks[event].push({
    matcher: '*',
    hooks: [{ type: 'command', command }],
  });
  return true;
}

function main() {
  if (!isGlobal) {
    const srcCheck = path.join(__dirname, 'beep.js');
    if (!fs.existsSync(srcCheck)) {
      eprintf('Error: beep.js not found in current directory.');
      eprintf('Run this script from the bibiReminder4cc project root.');
      process.exit(1);
    }
  }

  const { claudeDir, hooksDir, settingsFile, hooksDirRel } = getPaths();
  const cmdDone = getHookCommand(hooksDirRel, 'done');
  const cmdAllow = getHookCommand(hooksDirRel, 'allow');

  // Create directories
  if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  // Copy beep.js
  const src = path.join(__dirname, 'beep.js');
  const dest = path.join(hooksDir, 'beep.js');
  fs.copyFileSync(src, dest);

  // Read and update settings
  const settings = readSettings(settingsFile);

  const addedDone = addHook(settings, 'Stop', cmdDone);
  const addedAllow = addHook(settings, 'PermissionRequest', cmdAllow);

  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');

  // Summary
  console.log('✓ bibiReminder4cc installed' + (isGlobal ? ' (global)' : ''));
  console.log('  Settings:', settingsFile);
  if (addedDone) console.log('  + Stop hook: ' + cmdDone);
  else console.log('  ~ Stop hook: already present');
  if (addedAllow) console.log('  + PermissionRequest hook: ' + cmdAllow);
  else console.log('  ~ PermissionRequest hook: already present');

  console.log('');
  console.log('Testing beep...');
  try {
    execSync(`node "${dest}" --test`, { stdio: 'inherit', timeout: 15000 });
  } catch {}
}

main();
