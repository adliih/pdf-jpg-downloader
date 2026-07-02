import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import "@napi-rs/canvas";

const apiDir = path.dirname(fileURLToPath(import.meta.url));
const pdfjsRoot = path.join(apiDir, "pdfjs-dist");

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsModulePromise: Promise<PdfJsModule> | undefined;

function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsModulePromise) {
    const pdfjsModuleUrl = pathToFileURL(
      path.join(pdfjsRoot, "legacy/build/pdf.mjs"),
    ).href;
    pdfjsModulePromise = import(pdfjsModuleUrl) as Promise<PdfJsModule>;
  }
  return pdfjsModulePromise;
}

export async function convertPDFToImages(input: Buffer) {
  try {
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(input);
    const pdfDocument = await pdfjs.getDocument({
      data,
      standardFontDataUrl: path.join(pdfjsRoot, "standard_fonts/"),
      cMapUrl: path.join(pdfjsRoot, "cmaps/"),
      cMapPacked: true,
      isEvalSupported: false,
    }).promise;

    const images: Buffer[] = [];
    const scale = 3;

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const { canvas } = pdfDocument.canvasFactory.create(
        viewport.width,
        viewport.height,
        false,
      );

      await page.render({ canvas, viewport }).promise;
      images.push(canvas.toBuffer("image/png"));
    }

    if (images.length === 0) {
      throw new Error("No pages could be converted to images");
    }

    return images;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to convert PDF to images: ${error}`);
  }
}
