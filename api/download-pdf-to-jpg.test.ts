import handler from "./download-pdf-to-jpg";
import { downloadPDFAsBuffer } from "../lib/download.service";
import { convertPDFToImages } from "../lib/conversion.service";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

vi.mock("../lib/download.service");
vi.mock("../lib/conversion.service");
vi.mock("../lib/zip", () => ({
  zipBuffers: vi.fn().mockResolvedValue(Buffer.from("zip-data")),
}));

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as typeof res & VercelResponse;
}

describe("download-pdf-to-jpg API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when download_link is missing", async () => {
    const req = { method: "GET", query: {} } as VercelRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Download link is required" });
  });

  it("returns single image when PDF has one page", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";
    const mockImage = Buffer.from("mock-image-data");
    const mockPdf = Buffer.from("pdf");

    const req = {
      method: "GET",
      query: { download_link: mockDownloadLink },
    } as VercelRequest;
    const res = createMockRes();

    vi.mocked(downloadPDFAsBuffer).mockResolvedValue(mockPdf);
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await handler(req, res);

    expect(downloadPDFAsBuffer).toHaveBeenCalledWith(mockDownloadLink);
    expect(convertPDFToImages).toHaveBeenCalledWith(mockPdf);
    expect(res.headers["Content-Type"]).toBe("image/png");
    expect(res.headers["Content-Disposition"]).toBe(
      'attachment; filename="image.png"',
    );
    expect(res.body).toBe(mockImage);
  });

  it("uses custom filename when provided", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";
    const mockImage = Buffer.from("mock-image-data");
    const customFilename = "custom-name";

    const req = {
      method: "GET",
      query: { download_link: mockDownloadLink, filename: customFilename },
    } as VercelRequest;
    const res = createMockRes();

    vi.mocked(downloadPDFAsBuffer).mockResolvedValue(Buffer.from("pdf"));
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await handler(req, res);

    expect(res.headers["Content-Disposition"]).toBe(
      `attachment; filename="${customFilename}.png"`,
    );
  });
});
