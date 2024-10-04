const firebase = require("firebase-admin");
const serviceAccount = require("./secrets/savvy-serenity-424116-g1-c96d21178642.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: "gs://savvy-serenity-424116-g1.appspot.com",
});
const firestore = firebase.firestore();
const auth = firebase.auth();
const bucket = firebase.storage().bucket();

module.exports = {
  firestore,
  auth,
  bucket,
  firebase,
};
