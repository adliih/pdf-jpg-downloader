import type { VercelRequest, VercelResponse } from "@vercel/node";
import { downloadPDFAsBuffer } from "../lib/download.service";
import { convertPDFToImages } from "../lib/conversion.service";
import { zipBuffers } from "../lib/zip";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const downloadLink = req.query.download_link;
  const filenameParam = req.query.filename;

  if (typeof downloadLink !== "string" || !downloadLink) {
    return res.status(400).json({ error: "Download link is required" });
  }

  const filename =
    typeof filenameParam === "string" && filenameParam.trim()
      ? filenameParam.trim()
      : "image";

  try {
    const pdfBuffer = await downloadPDFAsBuffer(downloadLink);
    const images = await convertPDFToImages(pdfBuffer);

    if (images.length === 1) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.png"`,
      );
      return res.status(200).send(images[0]);
    }

    const zip = await zipBuffers(
      images.map((data, index) => ({
        name: `${filename}-${index + 1}.png`,
        data,
      })),
    );

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.zip"`,
    );
    return res.status(200).send(zip);
  } catch (error) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({ error: "Failed to process PDF" });
  }
}

export const config = {
  maxDuration: 60,
};
