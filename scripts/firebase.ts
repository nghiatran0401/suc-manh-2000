import firebase, { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const serviceAccount: ServiceAccount = {
  projectId: process.env.MY_FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.MY_FIREBASE_CLIENT_EMAIL as string,
  privateKey: process.env.MY_FIREBASE_PRIVATE_KEY ? process.env.MY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined,
};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: process.env.MY_FIREBASE_STORAGE_BUCKET,
});
const firestore = firebase.firestore();
const auth = firebase.auth();
const bucket = firebase.storage().bucket();

export { firestore, auth, bucket, firebase };
