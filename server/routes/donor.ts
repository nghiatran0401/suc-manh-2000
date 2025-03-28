import express from "express";
import { firestore } from "../firebase";

const donorRouters = express.Router();

donorRouters.get("/", async (req, res) => {
    try {
        const snapshot = await firestore.collection("donors").get();
        const donors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ donors });
    } catch (error) {
        res.status(500).json({ error: "something error" });
    }
});

export default donorRouters;
