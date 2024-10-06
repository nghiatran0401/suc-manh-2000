import express from "express";
import { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import routes from "./routes";

dotenv.config(); 
const app: Express = express();
app.use(cors());
app.use(bodyParser.json());
routes(app);

if (process.env.CURRENT_ENV === "Development") {
  app.listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));
} else if (process.env.CURRENT_ENV === "Production") {
  setGlobalOptions({ region: "asia-southeast1" });
  exports.app = onRequest({ timeoutSeconds: 240, minInstances: 1 }, app);
}
