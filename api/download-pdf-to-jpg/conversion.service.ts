// pdfjs-dist loads this optionally at runtime; declare it so Vercel bundles the native module.
import "@napi-rs/canvas";
import { pdf } from "pdf-to-img";

export async function convertPDFToImages(input: Buffer) {
  try {
    const document = await pdf(input, { scale: 3 });

    const images: Buffer[] = [];

    for await (const image of document) {
      images.push(image);
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
