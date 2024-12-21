import axios from "axios";

export async function downloadPDFAsStream(url: string) {
  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to download PDF: ${error}`);
  }
}
