import { pdf } from "pdf-to-img";

export async function convertPDFToImages(pdfPath: Parameters<typeof pdf>[0]) {
  try {
    // Read the PDF file
    const document = await pdf(pdfPath, { scale: 3 });

    const images = [];

    for await (const image of document) {
      images.push(image);
    }

    if (images.length === 0) {
      throw new Error("No pages could be converted to images");
    }

    console.log(`Converted Images`, images);

    return images;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to convert PDF to images: ${error}`);
  }
}
