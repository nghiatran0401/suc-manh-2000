import axios from "axios";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function getTrelloCardAttachmentsData(trelloCardId: string) {
  const url = `https://api.trello.com/1/cards/${trelloCardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;
  const attachmentsUrl = `https://api.trello.com/1/cards/${trelloCardId}/attachments?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;

  try {
    // const cardResponse = await axios.get(url);
    // const cardName = cardResponse.data.name;
    const cardAttachmentsResponse = await axios.get(attachmentsUrl);
    const attachments = cardAttachmentsResponse.data;

    return attachments
      .filter((attachment: any) => attachment.mimeType.includes("image"))
      .map((attachment: any) => ({
        caption: attachment.name,
        image: attachment.url,
      }));
  } catch (error: any) {
    console.error("[getTrelloCardAttachmentsData] error:", error);
  }
}

export { getTrelloCardAttachmentsData };
