import { get } from "./download-pdf-to-jpg";
import { downloadPDFAsStream } from "./download.service";
import { convertPDFToImages } from "./conversion.service";
import { APIError } from "encore.dev/api";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the dependent services
vi.mock("./download.service");
vi.mock("./conversion.service");

describe("PDF to JPG Download API", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock response object
    mockRes = {
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };
  });

  it("should throw error when download_link is missing", async () => {
    mockReq = {
      url: "http://localhost/download-pdf-to-jpg",
    };

    await expect(get(mockReq, mockRes)).rejects.toThrow(APIError);
  });

  it("should return single image when PDF has one page", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";
    const mockStream = "mock-stream";
    const mockImage = Buffer.from("mock-image-data");

    mockReq = {
      url: `http://localhost/download-pdf-to-jpg?download_link=${encodeURIComponent(
        mockDownloadLink
      )}`,
    };

    vi.mocked(downloadPDFAsStream).mockResolvedValue(mockStream);
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await get(mockReq, mockRes);

    expect(downloadPDFAsStream).toHaveBeenCalledWith(mockDownloadLink);
    expect(convertPDFToImages).toHaveBeenCalledWith(mockStream);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "image/jpg");
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="image.jpg"'
    );
    expect(mockRes.write).toHaveBeenCalledWith(mockImage);
  });

  it("should use custom filename when provided", async () => {
    const mockDownloadLink = "http://example.com/test.pdf";
    const mockStream = "mock-stream";
    const mockImage = Buffer.from("mock-image-data");
    const customFilename = "custom-name";

    mockReq = {
      url: `http://localhost/download-pdf-to-jpg?download_link=${encodeURIComponent(
        mockDownloadLink
      )}&filename=${customFilename}`,
    };

    vi.mocked(downloadPDFAsStream).mockResolvedValue(mockStream);
    vi.mocked(convertPDFToImages).mockResolvedValue([mockImage]);

    await get(mockReq, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      `attachment; filename="${customFilename}.jpg"`
    );
  });
});
