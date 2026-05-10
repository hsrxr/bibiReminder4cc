<p align="center">
  <img src="media/bbr4cc.png" alt="bibiReminder4cc logo" width="500">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D14-339933?logo=node.js&logoColor=white" alt="Node"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
</p>

**Audible beep notifications for Claude Code.** Alt-tab freely — distinct beep sounds tell you exactly when CC needs your attention.

---

## 👂 Sound Patterns

Each event has its own distinct sound so you know what's happening without looking at the screen.

![Beep patterns visualization](media/beep-patterns.svg)

| Event | Pattern | Pitch | What's happening |
|-------|---------|-------|------------------|
| **Task complete** `Stop` | ▸▸ **High-high** | 1200Hz → 1500Hz | Claude finished responding — come check the result |
| **Permission needed** `PermissionRequest` | ▸▸ **Low-low** | 600Hz → 500Hz | Claude is waiting for you to allow/deny an action |

---

## ⚡ Quick Start

```bash
# One-time setup — works for ALL your projects
git clone https://github.com/hsrxr/bibiReminder4cc.git
cd bibiReminder4cc
node install.js
```

That's it. The next time Claude Code finishes a task or hits a permission prompt, you'll hear it.

---

## 🔧 How It Works

bibiReminder4cc uses [Claude Code's hooks system](https://code.claude.com/docs/en/hooks) to intercept two lifecycle events.

```mermaid
graph LR
    CC[("💬 Claude Code")]
    
    CC -- "Stop event<br/>(task done)" --> BEEP
    CC -- "PermissionRequest event<br/>(waiting for you)" --> BEEP
    
    BEEP["beep.js<br/>(zero deps)"]
    
    BEEP -- "PowerShell Beep()" --> WIN["🪟 Windows<br/>★ Best"]
    BEEP -- "osascript beep" --> MAC["🍎 macOS<br/>★ Good"]
    BEEP -- "terminal bell \\a" --> LIN["🐧 Linux<br/>★ Basic"]
    
    WIN --> SPEAKER["🔊 Speaker"]
    MAC --> SPEAKER
    LIN --> SPEAKER
    
    style BEEP fill:#1f2937,stroke:#3fb950,color:#e6edf3
    style CC fill:#1f2937,stroke:#58a6ff,color:#e6edf3
    style SPEAKER fill:#1f2937,stroke:#d29922,color:#e6edf3
```

**The installer:**
1. Installs globally to `~/.claude/` by default — works for **all** your projects
2. Adds `Stop` and `PermissionRequest` hooks to `~/.claude/settings.json`
3. Copies `beep.js` to `~/.claude/hooks/beep.js`
4. That's it — zero config, zero npm dependencies

> Use `node install.js --local` to install only for the current project (`.claude/settings.local.json`),
> useful if you want to share the config with teammates via git.

---

## 🗑️ Uninstall

```bash
node uninstall.js          # Remove global install
node uninstall.js --local  # Remove per-project install
```

---

## 💻 Platform Support

| Platform | Sound Method | Sound Quality |
|----------|-------------|---------------|
| Windows 10/11 | `[Console]::Beep()` via PowerShell | ★★★ Distinct pitched beeps |
| macOS | `osascript -e 'beep'` | ★★☆ System beep |
| Linux | Terminal bell (`\x07`) | ★☆☆ Basic beep |

---

## ❓ Troubleshooting

**🔇 No sound?**
- **Windows**: Ensure PowerShell is available (it's included with Windows 10/11)
- **macOS**: Make sure your system volume is on and not muted
- **Linux**: Check that your terminal emulator supports the bell character (`\a`). Enable "terminal bell" in your terminal settings
- **All platforms**: Verify Claude Code hooks are not disabled (`--bare` mode disables hooks)

**⛔ Hooks not firing?**
- Make sure you're not running Claude Code with `--bare` (it disables hooks)
- Check that `.claude/settings.local.json` contains the hooks section
- Verify `beep.js` exists at `.claude/hooks/beep.js`

**🤔 Permission prompt about running beep.js?**
- The first time a hook runs, Claude Code may ask for permission. Approve it once and it will be remembered.

---

## 📁 What Gets Modified (global install)

**`~/.claude/settings.json`** — `hooks` section is added. Your existing settings are untouched.

**`~/.claude/hooks/beep.js`** — the cross-platform beep script.

Everything stays in `~/.claude/`, out of your project's way.

> For per-project install (`--local`), the files go into `.claude/` within that project.

---

## 📦 Files

```
bibiReminder4cc/
├── beep.js          # Cross-platform beep script (core logic)
├── install.js       # One-shot installer
├── uninstall.js     # Clean uninstaller
├── package.json     # npm metadata
├── README.md        # This file
├── LICENSE          # MIT
└── media/
    ├── bbr4cc.png            # Project logo
    └── beep-patterns.svg     # Sound pattern visualization
```

---

## 🧪 Development

```bash
node beep.js --test   # Test both sound patterns
```

---

## 📄 License

MIT
