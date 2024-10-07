import firebase, { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY) : undefined,
};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const firestore = firebase.firestore();
const auth = firebase.auth();
const bucket = firebase.storage().bucket();

export { firestore, auth, bucket, firebase };
