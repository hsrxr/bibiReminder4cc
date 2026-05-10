#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const isLocal = process.argv.includes('--local');

function eprintf(...args) {
  process.stderr.write(args.join(' ') + '\n');
}

function getPaths() {
  if (isLocal) {
    const cwd = process.cwd();
    return {
      hooksDir: path.join(cwd, '.claude', 'hooks'),
      settingsFile: path.join(cwd, '.claude', 'settings.local.json'),
    };
  }
  const home = os.homedir();
  const claudeDir = path.join(home, '.claude');
  return {
    hooksDir: path.join(claudeDir, 'hooks'),
    settingsFile: path.join(claudeDir, 'settings.local.json'),
  };
}

function removeBeepHooks(settings) {
  if (!settings.hooks) return false;

  const events = ['Stop', 'PermissionRequest'];
  let changed = false;

  for (const event of events) {
    const entries = settings.hooks[event];
    if (!Array.isArray(entries)) continue;

    const filtered = entries
      .map((entry) => {
        if (!Array.isArray(entry.hooks)) return entry;
        const remaining = entry.hooks.filter(
          (h) => !(h.type === 'command' && h.command && h.command.includes('beep.js'))
        );
        if (remaining.length === entry.hooks.length) return entry;
        changed = true;
        if (remaining.length === 0) return null;
        return { ...entry, hooks: remaining };
      })
      .filter((e) => e !== null);

    if (filtered.length === 0) {
      delete settings.hooks[event];
      changed = true;
    } else {
      settings.hooks[event] = filtered;
    }
  }

  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  return changed;
}

function main() {
  const { hooksDir, settingsFile } = getPaths();

  // Remove from settings
  let settingsChanged = false;
  try {
    const raw = fs.readFileSync(settingsFile, 'utf-8');
    const settings = JSON.parse(raw);
    settingsChanged = removeBeepHooks(settings);
    if (settingsChanged) {
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      eprintf('Warning: could not read settings file:', settingsFile);
      eprintf(err.message);
    }
  }

  // Delete beep.js
  const beepFile = path.join(hooksDir, 'beep.js');
  let beepDeleted = false;
  try {
    fs.unlinkSync(beepFile);
    beepDeleted = true;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      eprintf('Warning: could not delete', beepFile);
      eprintf(err.message);
    }
  }

  // Remove hooks dir if empty
  try {
    const files = fs.readdirSync(hooksDir);
    if (files.length === 0) fs.rmdirSync(hooksDir);
  } catch {}

  // Summary
  console.log('✓ bibiReminder4cc uninstalled' + (isLocal ? ' (project-level)' : ' (global)'));
  if (settingsChanged) console.log('  ~ Hooks removed from settings');
  else console.log('  ~ No hooks found in settings');
  if (beepDeleted) console.log('  ~ beep.js deleted');
}

main();
