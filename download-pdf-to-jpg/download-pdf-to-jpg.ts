import { api, APIError } from "encore.dev/api";
import { downloadPDFAsStream } from "./download.service";
import { convertPDFToImages } from "./conversion.service";

interface Params {
  download_link: string;
  filename?: string;
}

export const get = api.raw(
  {
    method: "GET",
    path: "/download-pdf-to-jpg",
    expose: true,
  },
  async (req, res) => {
    const url = new URL(req.url!, "http://localhost");
    const downloadLink = url.searchParams.get("download_link");
    const filename = url.searchParams.get("filename") || "image";

    if (!downloadLink) {
      throw APIError.invalidArgument("Download link is required");
    }

    try {
      const stream = await downloadPDFAsStream(downloadLink);
      const images = await convertPDFToImages(stream);

      const isMultipleImages = images.length > 1;

      if (!isMultipleImages) {
        const imageBuffer = images[0];
        res.setHeader("Content-Type", "image/jpg");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.jpg"`
        );
        res.write(imageBuffer);
        return;
      }

      const archiver = require("archiver");
      const archive = archiver("zip");
      const zip = Buffer.from([]);
      archive.append(images.map((img) => img));
      archive.finalize();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.zip"`
      );
      res.write(zip);
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw APIError.internal("Failed to process PDF");
    }
  }
);
