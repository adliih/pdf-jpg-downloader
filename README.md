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

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space).
2. Choose **Docker** as the SDK (or push this repo and set SDK to Docker in Space settings).
3. Push this repository to the Space repo (or use “Import from GitHub” if the project is on GitHub).
4. Ensure the Space README keeps the YAML header above (`sdk: docker`, `app_port: 7860`).
5. Wait for the Space build; the app serves on the Space URL at `/`.

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
