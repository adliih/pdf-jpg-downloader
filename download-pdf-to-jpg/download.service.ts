export async function downloadPDFAsStream(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return bytes;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to download PDF: ${error}`);
  }
}
