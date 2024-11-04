import express from "express";
import { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import routes from "./routes";

dotenv.config();
export const app: Express = express();
app.use(cors());
app.use(bodyParser.json());
routes(app);

if (process.env.CURRENT_ENV === "Development") {
  app.listen("4000", () => console.log(`Server running on port 4000`));
} else if (process.env.CURRENT_ENV === "Production") {
  setGlobalOptions({ region: "asia-southeast1", maxInstances: 3 });
  exports.app = onRequest({ memory: "512MiB", timeoutSeconds: 360, concurrency: 100, minInstances: 1 }, app);
}
