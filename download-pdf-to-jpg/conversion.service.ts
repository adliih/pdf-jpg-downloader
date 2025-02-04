import { pdf } from "pdf-to-img";
import { ReadableStream } from "stream/web";

export async function convertPDFToImages(input: ReadableStream) {
  try {
    // Read the PDF file
    const document = await pdf(input as unknown as NodeJS.ReadableStream, {
      scale: 3,
    });

    const images = [];

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
