# bibiReminder4cc 🔔

**Audible beep notifications for Claude Code.**

Never miss when Claude Code finishes a task or waits for your permission again. bibiReminder4cc plays distinct beep sounds through your computer speakers so you can alt-tab freely and still know exactly when CC needs your attention.

## Sounds

| Event | Pattern | Meaning |
|-------|---------|---------|
| Task complete | ▸▸ **High-high** (1200Hz → 1500Hz) | Claude finished responding — come check the result |
| Permission needed | ▸▸ **Low-low** (600Hz → 500Hz) | Claude is waiting for you to allow/deny an action |

## Quick Start

```bash
# Clone and install
git clone https://github.com/hsrxr/bibiReminder4cc.git
cd bibiReminder4cc
node install.js

# Or install globally (for all projects)
node install.js --global
```

That's it. The next time Claude Code finishes a task or hits a permission prompt, you'll hear it.

## How It Works

bibiReminder4cc uses [Claude Code's hooks system](https://code.claude.com/docs/en/hooks) to register two event handlers:

- **Stop** event → fires when Claude finishes responding → plays two high-pitched beeps
- **PermissionRequest** event → fires when a permission dialog appears → plays two lower beeps

The installer adds these hooks to `.claude/settings.local.json` without touching your existing configuration. A small `beep.js` script (Node.js, zero dependencies) handles cross-platform sound playback.

```
┌─────────────────────┐         ┌──────────────────┐         ┌─────────┐
│  Claude Code        │  hook   │  beep.js          │  sound  │ Speaker │
│                     │────────►│  (Node.js, 0 dep) │────────►│         │
│  Stop               │         │                   │         │  ▸▸ ▸▸  │
│  PermissionRequest  │         │  Win: PowerShell  │         └─────────┘
└─────────────────────┘         │  Mac: osascript   │
                                │  Linux: terminal  │
                                └──────────────────┘
```

## Uninstall

```bash
node uninstall.js        # Remove from current project
node uninstall.js --global   # Remove global install
```

## Platform Support

| Platform | Sound Method | Quality |
|----------|-------------|---------|
| Windows 10/11 | `[Console]::Beep()` via PowerShell | ★★★ Best — distinct pitched beeps |
| macOS | `osascript -e 'beep'` | ★★☆ System beep |
| Linux | Terminal bell (`\x07`) | ★☆☆ Basic beep |

### Troubleshooting

**No sound?**
- **Windows**: Ensure PowerShell is available (it's included with Windows 10/11)
- **macOS**: Make sure your system volume is on and not muted
- **Linux**: Check that your terminal emulator supports the bell character (`\a`). Enable "terminal bell" in your terminal settings
- **All platforms**: Verify Claude Code hooks are not disabled (`--bare` mode disables hooks)

**Hooks not firing?**
- Make sure you're not running Claude Code with `--bare` (it disables hooks)
- Check that `.claude/settings.local.json` contains the hooks section
- Verify `beep.js` exists at `.claude/hooks/beep.js`

**Permission prompt about running beep.js?**
- The first time a hook runs, Claude Code may ask for permission. Approve it once and it will be remembered.

## What Gets Modified

Only **one file** is modified:

- **`.claude/settings.local.json`** — the `hooks` section is added. All existing settings (`permissions`, etc.) are preserved exactly as-is.

One file is created:

- **`.claude/hooks/beep.js`** — the cross-platform beep script.

Both are local to the project and won't affect other projects (unless you use `--global`).

## Files

```
bibiReminder4cc/
├── beep.js          # Cross-platform beep script (core logic)
├── install.js       # One-shot installer
├── uninstall.js     # Clean uninstaller
├── package.json     # npm metadata
├── README.md        # This file
└── LICENSE          # MIT
```

## Development

```bash
node beep.js --test   # Test both sound patterns
```

## License

MIT
