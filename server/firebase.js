const admin = require("firebase-admin");
const serviceAccount = require("./sucmanh2000-2b5f0-30283b427af5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "sucmanh2000-2b5f0.appspot.com",
});

module.exports = { admin };
