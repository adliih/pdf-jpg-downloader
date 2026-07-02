import archiver from "archiver";

export function zipBuffers(
  files: { name: string; data: Buffer }[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip");
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    for (const file of files) {
      archive.append(file.data, { name: file.name });
    }

    void archive.finalize();
  });
}
