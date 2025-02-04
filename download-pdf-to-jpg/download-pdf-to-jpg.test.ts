import { get } from "./download-pdf-to-jpg";
import { downloadPDFAsStream } from "./download.service";
import { convertPDFToImages } from "./conversion.service";
import { APIError } from "encore.dev/api";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReadableStream } from "node:stream/web";

// Mock the dependent services
vi.mock("./download.service");
vi.mock("./conversion.service");

describe("PDF to JPG Download API", () => {
  let mockReq: any;
  // Mock response object
  let mockRes = {
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
  const mockStream = new ReadableStream();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it("should throw error when download_link is missing", async () => {
    mockReq = {
      url: "http://localhost/download-pdf-to-jpg",
    };

    await expect(get(mockReq, mockRes as any)).rejects.toThrow(APIError);
  });

  it("should return single image when PDF has one page", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";
    const mockImage = Buffer.from("mock-image-data");

    mockReq = {
      url: `http://localhost/download-pdf-to-jpg?download_link=${encodeURIComponent(
        mockDownloadLink
      )}`,
    };

    vi.mocked(downloadPDFAsStream).mockResolvedValue(mockStream);
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await get(mockReq, mockRes as any);

    expect(downloadPDFAsStream).toHaveBeenCalledWith(mockDownloadLink);
    expect(convertPDFToImages).toHaveBeenCalledWith(mockStream);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "image/jpg");
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'filename="image.jpg"'
    );
    expect(mockRes.end).toHaveBeenCalledWith(mockImage);
  });

  it("should use custom filename when provided", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";

    const mockImage = Buffer.from("mock-image-data");
    const customFilename = "custom-name";

    mockReq = {
      url: `http://localhost/download-pdf-to-jpg?download_link=${encodeURIComponent(
        mockDownloadLink
      )}&filename=${customFilename}`,
    };

    vi.mocked(downloadPDFAsStream).mockResolvedValue(mockStream);
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await get(mockReq, mockRes as any);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      `filename="${customFilename}.jpg"`
    );
  });
});
