const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function getTrelloCardAttachmentsData(trelloCardId) {
  const url = `https://api.trello.com/1/cards/${trelloCardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;
  const attachmentsUrl = `https://api.trello.com/1/cards/${trelloCardId}/attachments?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;

  try {
    // const cardResponse = await axios.get(url);
    // const cardName = cardResponse.data.name;
    const cardAttachmentsResponse = await axios.get(attachmentsUrl);
    const attachments = cardAttachmentsResponse.data;

    return attachments
      .filter((attachment) => attachment.mimeType.includes("image"))
      .map((attachment) => ({
        caption: attachment.name,
        image: attachment.url,
      }));
  } catch (error) {
    console.error("[getTrelloCardAttachmentsData] error:", error);
  }
}

module.exports = { getTrelloCardAttachmentsData };
