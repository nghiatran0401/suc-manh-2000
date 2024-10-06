import firebase, { ServiceAccount } from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH as string;
const serviceAccount: ServiceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: "gs://savvy-serenity-424116-g1.appspot.com",
});
const firestore = firebase.firestore();
const auth = firebase.auth();
const bucket = firebase.storage().bucket();

export { firestore, auth, bucket, firebase };
