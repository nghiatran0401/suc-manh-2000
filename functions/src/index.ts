import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";

import route from "./routes";
import {ErrorMiddleware} from "./utils/errorHandler";

const app = express();
app.use(cors());

route(app);
app.use(ErrorMiddleware);


exports.app = functions.region("asia-southeast2").https.onRequest(app);
