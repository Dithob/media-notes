# media-notes

[中文](README.md) · [日本語](README.ja.md)

> A one-stop workspace that turns audio & video into structured notes.

`media-notes` extracts audio/video content and distills it into **structured, human-readable notes**: the `media-content-distiller` skill pulls subtitles from platforms like Bilibili and YouTube (powered by BibiGPT), then an AI agent (e.g. Codex) turns the transcripts into `note` / `guide` / `manual` files — publishable to a personal site with one command.

## Features

| Feature | Description |
| --- | --- |
| 🎬 Multi-platform subtitles | Subtitle acquisition from Bilibili / YouTube etc., with raw cues archived as evidence |
| 🤖 Agent-driven distillation | Transcripts → structured notes with agreed naming, indexing and cross-links |
| 📂 Main products / byproducts split | Human-readable notes in `media-note/`, raw artifacts in `byproducts/` |
| 📤 One-way publishing | `scripts/publish-notes.mjs` publishes to a personal site; byproducts never go public |
| 🔒 Public-repo safety boundary | Full ASR transcripts stay local (gitignored) — the public repo contains no byproducts |

Target site: <https://dithob.github.io/notes/> (Astro · GitHub Pages/Actions auto-build).

## Layout

```text
media-notes/
├── README.md / README.en.md / README.ja.md   # Trilingual README
├── AGENTS.md                                 # Operating manual for agents (naming, workflow, security)
├── media-note/                               # Main products: finished human-readable notes (flat)
│   ├── README.md                             # Note index
│   └── <title> <type>.md
├── byproducts/                               # Byproducts: subtitles, metadata, transcripts (local only)
│   └── <source-id>/
├── scripts/                                  # Publishing script publish-notes.mjs
├── skills/                                   # skills.sh skill source (media-content-distiller etc.)
├── .pi/skills/                               # pi project skill (media-notes-publishing)
└── docs/                                     # Design documents
```

## Quick start

1. Fetch subtitles: `python <skill>/scripts/acquire_subtitle.py subtitle --input "<URL>" --output-dir ./byproducts --main-product-dir ./media-note --preflight`
2. Have an agent write the main product `media-note/<title> <type>.md` from the transcript
3. Update the `media-note/README.md` index and append a `## 副产物导航` (byproduct navigation) section at the end of the note
4. (Optional) `node scripts/publish-notes.mjs --write` to publish to the personal site

Naming rules, workflow details and known pitfalls: [AGENTS.md](AGENTS.md) (in Chinese); full publishing design: [docs/site-notes-publishing.md](docs/site-notes-publishing.md).

## Publishing

```bash
node scripts/publish-notes.mjs           # dry run: report only, no writes
node scripts/publish-notes.mjs --write   # write into the site repo's src/content/notes/
```

Only note bodies are published; byproducts are never public. Each note needs one config entry in `scripts/publish.config.mjs` (slug, category, summaries, etc. — only fields the script cannot derive); the rest of the metadata is parsed from file names, the index table and the source reference block in the note body.

## Skills source (skills.sh)

This repo also feeds [skills.sh](https://skills.sh): [`skills/`](skills/README.md) holds `media-content-distiller` and `extract-tool-registration`; the project's own `media-notes-publishing` lives in `.pi/skills/` (a pi project skill, part of the source too). Any agent can install with one command:

```bash
npx skills add Dithob/media-notes --skill media-content-distiller
npx skills add Dithob/media-notes --skill extract-tool-registration
npx skills add Dithob/media-notes --skill media-notes-publishing
npx skills add Dithob/media-notes --list        # list all
```

[![skills.sh](https://skills.sh/b/Dithob/media-notes)](https://skills.sh/Dithob/media-notes)

## Security

**This repository is public.** `byproducts/` (raw subtitles, timed transcripts) is gitignored and no longer tracked; if historical commits contain byproducts, rewrite history with `git filter-repo --path byproducts/ --invert-paths`. Tokens and account files are likewise kept out of the repo. Full policy: [AGENTS.md](AGENTS.md#安全红线) (in Chinese).
