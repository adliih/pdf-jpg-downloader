export async function downloadPDFAsStream(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("No response body");
    }
    return response.body;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to download PDF: ${error}`);
  }
}
