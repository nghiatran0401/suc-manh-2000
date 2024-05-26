const express = require("express");
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

app.listen("4000", () => {
  console.log(`Server running on port 4000`);
});

setGlobalOptions({ region: "asia-southeast1" });
exports.app = onRequest({ timeoutSeconds: 240, minInstances: 1 }, app);
