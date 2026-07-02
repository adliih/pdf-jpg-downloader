import io
import re
import zipfile
from pathlib import Path

import fitz
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
RENDER_SCALE = 3.0
DEFAULT_FILENAME = "image"

app = FastAPI(title="PDF to image")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def sanitize_filename(name: str) -> str:
    cleaned = re.sub(r'[^\w\s\-_.]', "", name, flags=re.UNICODE).strip()
    return cleaned or DEFAULT_FILENAME


def download_pdf(url: str) -> bytes:
    with httpx.Client(follow_redirects=True, timeout=120.0) as client:
        response = client.get(url)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "")
        if "pdf" not in content_type.lower() and not url.lower().split("?")[0].endswith(
            ".pdf"
        ):
            # Google Sheets export often returns PDF without a clear content-type.
            if len(response.content) < 4 or response.content[:4] != b"%PDF":
                raise ValueError("URL did not return a PDF")
        return response.content


def pdf_to_png_pages(pdf_bytes: bytes) -> list[bytes]:
    matrix = fitz.Matrix(RENDER_SCALE, RENDER_SCALE)
    images: list[bytes] = []

    with fitz.open(stream=pdf_bytes, filetype="pdf") as document:
        if document.page_count == 0:
            raise ValueError("PDF has no pages")
        for page in document:
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            images.append(pixmap.tobytes("png"))

    return images


def build_zip(files: list[tuple[str, bytes]]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in files:
            archive.writestr(name, data)
    return buffer.getvalue()


async def convert_download(
    download_link: str,
    filename: str | None,
) -> Response:
    base_name = sanitize_filename(filename or DEFAULT_FILENAME)

    try:
        pdf_bytes = download_pdf(download_link)
        pages = pdf_to_png_pages(pdf_bytes)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to download PDF: {exc}") from exc
    except (ValueError, fitz.FileDataError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to process PDF") from exc

    if len(pages) == 1:
        return Response(
            content=pages[0],
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="{base_name}.png"',
            },
        )

    zip_bytes = build_zip(
        [(f"{base_name}-{index}.png", data) for index, data in enumerate(pages, start=1)]
    )
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{base_name}.zip"',
        },
    )


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/styles.css")
async def styles() -> FileResponse:
    return FileResponse(STATIC_DIR / "styles.css", media_type="text/css")


@app.get("/download-pdf-to-jpg")
@app.get("/api/download-pdf-to-jpg")
async def download_pdf_to_jpg(
    download_link: str = Query(..., min_length=1),
    filename: str | None = Query(None),
) -> Response:
    return await convert_download(download_link, filename)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
