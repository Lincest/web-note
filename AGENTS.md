# AGENTS.md — Developer & Agent Guide

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 7.4 (Apache) |
| Frontend | Vanilla JS + HTML5 + CSS3 (no framework) |
| Storage | File-based (`_tmp/` directory, one file per note) |
| Container | Docker + Docker Compose |
| Registry | GitHub Container Registry (`ghcr.io/Lincest/web-note`) |

Key source files:
- `index.php` — PHP backend (file I/O, routing, HTML template)
- `script.js` — Auto-save, image paste/upload
- `markdown.js` — Markdown preview (Cmd+E), Tab indent
- `format.js` — JSON/XML/ION formatter, paste auto-format, collapsible tree viewer
- `copy.js` — Clipboard, QR code, `showNotification()`
- `history.js` — Local history sidebar (localStorage)
- `styles.css` — All styles, light/dark mode
- `Dockerfile` — Build definition (Apache + PHP)
- `docker-compose.yml` — Local dev / self-host config

---

## Local Development

### Prerequisites

- Docker Desktop running
- Git

### Start dev server

```bash
git clone https://github.com/Lincest/web-note.git
cd web-note
docker compose up --build
```

App is available at **http://localhost**.

Notes are persisted to `./data/` (mounted into container as `_tmp/`).

### Apply code changes

After editing any source file, rebuild and restart:

```bash
docker compose up --build -d
```

The `-d` flag runs in the background. Logs:

```bash
docker compose logs -f
```

### Stop

```bash
docker compose down
```

---

## Adding a New JS File

1. Create the file (e.g., `myfeature.js`) in the repo root.
2. Add it to the `COPY` line in `Dockerfile`:
   ```dockerfile
   COPY .htaccess index.php styles.css ... myfeature.js /var/www/html/
   ```
3. Add a `<script>` tag at the bottom of `<body>` in `index.php`:
   ```html
   <script src="<?php print $base_url; ?>/myfeature.js"></script>
   ```
4. Rebuild: `docker compose up --build -d`

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+S` | Save |
| `Cmd/Ctrl+E` | Toggle markdown / structured preview |
| `Cmd/Ctrl+K` | Toggle history sidebar |
| `Cmd/Ctrl+L` | Show QR code |
| `Cmd/Ctrl+Shift+F` | Auto-format JSON / XML / ION |
| `Tab` / `Shift+Tab` | Indent / unindent |

---

## Publishing — Trigger GitHub Docker Build

Releases use annotated Git tags. The CI workflow (`.github/workflows/publish.yml`) triggers on tags matching the pattern `<app-name>/vX.Y.Z` and pushes to `ghcr.io/Lincest/web-note:<version>`.

### Steps

```bash
# 1. Commit and push your changes first
git add .
git commit -m "feat: describe your change"
git push origin main

# 2. Check the latest tag
git tag --sort=-version:refname | head -5

# 3. Create and push an annotated tag (bump the patch/minor/major as appropriate)
git tag -a web-note/v1.9.4 -m "short description of release"
git push origin web-note/v1.9.4
```

The tag **must** be annotated (`-a`) — lightweight tags are rejected by this repo's workflow.

### Tag naming

```
web-note/vMAJOR.MINOR.PATCH
```

| Change type | Bump |
|-------------|------|
| Bug fix, small improvement | PATCH (`1.9.2` → `1.9.3`) |
| New feature, backward-compatible | MINOR (`1.9.x` → `1.10.0`) |
| Breaking change | MAJOR (`1.x.x` → `2.0.0`) |

### Monitor the build

Go to **https://github.com/Lincest/web-note/actions** to watch the workflow run.

On success the image is available at:
```
ghcr.io/lincest/web-note:<version>
ghcr.io/lincest/web-note:latest   ← updated automatically
```

---

## Environment Variables (optional)

Set in `docker-compose.yml` under `environment:`:

| Variable | Default | Description |
|----------|---------|-------------|
| `FILE_LIMIT` | `100000` | Max number of notes |
| `SINGLE_FILE_SIZE_LIMIT` | `102400` | Max size per note (bytes) |
