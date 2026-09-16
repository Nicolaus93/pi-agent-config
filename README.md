# pi agent config

Global config for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent):
an orchestrator extension that delegates all work to subagents (scout / planner /
worker / reviewer / visual-tester), plus provider and LSP settings.

Built against **pi 0.83.0**.

## Install

Clone into your pi global config directory:

    git clone https://github.com/Nicolaus93/pi-agent-config.git ~/.pi/agent

If `~/.pi/agent` already exists, clone elsewhere and copy the files in:

    git clone https://github.com/Nicolaus93/pi-agent-config.git /tmp/pi-agent-config
    cp -r /tmp/pi-agent-config/{settings.json,models.json,lsp.json,AGENTS.md,agents,extensions} ~/.pi/agent/

Then start `pi`. The packages listed in `settings.json` (`pi-mcp-adapter`,
`pi-lsp`, `pi-interactive-subagents`, `chrome-cdp-skill`) are fetched
automatically on first run — no vendored `npm/` or `git/` directories needed.

## What's here

| Path                          | What it does |
|-------------------------------|--------------|
| `settings.json`               | Default provider/model, theme, package list |
| `agents/`                     | Subagent role definitions (pi-agent, planner, scout, worker, reviewer, visual-tester) |
| `extensions/main-orchestrator.ts` | Forces the main session into orchestrator-only mode: it may only call subagent tools, never edit files itself. Also prompts for confirmation before starting a planning session. |
| `extensions/disable-amazon-bedrock.ts` | Hides the built-in Bedrock models from the catalog |
| `models.json`                 | Local llama.cpp provider (Qwen3.x GGUF builds) |
| `lsp.json`                    | pyright language server for Python projects |
| `AGENTS.md`                   | Global instructions — routes to the ripwire skills |

## Before it will work for you

1. **OpenAI Codex provider.** Everything defaults to `openai-codex` models
   (`gpt-5.6-sol`, `gpt-5.6-luna`, `gpt-6-astra` for the planner). You need that
   provider authenticated. To use a different provider, change it in **three**
   places: `settings.json` (`defaultProvider` / `defaultModel`), the `model:`
   frontmatter in each `agents/*.md`, and the hardcoded
   `modelRegistry.find("openai-codex", "gpt-5.6-sol")` in
   `extensions/main-orchestrator.ts`.

2. **Local llama server (optional).** `models.json` expects an OpenAI-compatible
   server on `http://127.0.0.1:8080/v1`. Drop that block if you don't run one.

3. **ripwire (optional).** `AGENTS.md` tells the agent to use the ripwire skills
   for codebase orientation and review. Those live outside this config (they were
   symlinks into `~/.local/share/ripwire/`), so they are *not* included — install
   ripwire separately, or delete that line from `AGENTS.md`.

4. **pyright (optional).** `lsp.json` expects `pyright-langserver` on your PATH.

## Deliberately not included

Credentials (`auth.json`), machine caches (`models-store.json`,
`mcp-cache.json`), local trust decisions (`trust.json`, `trust/`), session
history (`sessions/`), and auto-installed packages (`npm/`, `git/`).

This repo lives *in* `~/.pi/agent`, so `.gitignore` is written as an allowlist:
it ignores `*` and then un-ignores only the files above. Nothing else can be
staged, even by `git add -A`.
