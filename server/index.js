const {postTriggerToUpdateRedisDb} = require("./triggers/postWrite");


const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const routes = require("./routes");
// const ErrorMiddleware = require("./utils/errorHandler");

const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(ErrorMiddleware);
routes(app);

if (false && process.env.CURRENT_ENV === "Development") {
  app.listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));
} else if (true || process.env.CURRENT_ENV === "Production") {
  setGlobalOptions({ region: "asia-southeast1" });
  exports.app = onRequest({ timeoutSeconds: 240, minInstances: 1 }, app);
  exports.postTriggerToUpdateRedisDb = postTriggerToUpdateRedisDb;
}
