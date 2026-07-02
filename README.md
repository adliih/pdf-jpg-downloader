---
title: PDF to PNG Converter
emoji: 📄
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mpl-2.0
---

# PDF to PNG Converter

Small FastAPI app: paste a public PDF URL (e.g. Google Sheets export), get PNG page images back (single file or ZIP).

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 7860
```

Open [http://localhost:7860](http://localhost:7860).

## Docker

```bash
docker build -t pdf-jpg-downloader .
docker run --rm -p 7860:7860 pdf-jpg-downloader
```

## Deploy on Hugging Face Spaces

Space: [adliih/pdf-jpg-downloader](https://huggingface.co/spaces/adliih/pdf-jpg-downloader) (Docker, port 7860).

Pushes to **`main`** on GitHub sync to the Space via [GitHub Actions](https://huggingface.co/docs/hub/spaces-github-actions) (`.github/workflows/sync-to-hub.yml`). Add an `HF_TOKEN` secret with write access to the Space.

Manual deploy:

```bash
hf upload adliih/pdf-jpg-downloader . . --repo-type space \
  --exclude ".git/**" --exclude ".venv/**" --exclude "**/__pycache__/**"
```

No GPU is required. Use a **CPU basic** Space tier unless you expect heavy traffic.

## API

`GET /download-pdf-to-jpg` (alias: `/api/download-pdf-to-jpg`)

| Query param     | Required | Description                                |
|-----------------|----------|--------------------------------------------|
| `download_link` | yes      | Public HTTPS URL that returns a PDF body   |
| `filename`      | no       | Base name for downloads (default: `image`) |

- One page → `image/png` (`{filename}.png`)
- Multiple pages → `application/zip` (`{filename}.zip`)

`GET /health` → `{"status":"ok"}`

## Notes

- Output is **PNG** (PyMuPDF); the route name is kept for compatibility.
- The PDF URL must be reachable from the server (works well for Google Sheets `exportFormat=pdf` links).
- Large PDFs or high page counts may hit Space memory or timeout limits; reduce export scale in the source if needed.
