const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const { indexNewDocumentToRedis } = require("./triggers/firestore-functions");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
routes(app);

if (process.env.CURRENT_ENV === "Development") {
  app.listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));
} else if (process.env.CURRENT_ENV === "Production") {
  setGlobalOptions({ region: "asia-southeast1" });
  exports.app = onRequest({ timeoutSeconds: 240, minInstances: 1 }, app);
  exports.indexNewDocumentToRedis = indexNewDocumentToRedis;
}
