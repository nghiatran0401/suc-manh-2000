import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1kVPFWqEAxDmGZX0H7LI4fyZnOy77F1Q",
  authDomain: "sucmanh2000-2b5f0.firebaseapp.com",
  projectId: "sucmanh2000-2b5f0",
  storageBucket: "sucmanh2000-2b5f0.appspot.com",
  messagingSenderId: "231567088266",
  appId: "1:231567088266:web:7302b91a3214e71d17eb73",
  measurementId: "G-ETJ8J7VBTE",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
