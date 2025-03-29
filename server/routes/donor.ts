import express from "express";
import { firestore } from "../firebase";

const donorRouters = express.Router();

donorRouters.get("/", async (req, res) => {
  try {
    const donorSnapshot = await firestore.collection("donors").get();
    const donors = donorSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const donationSnapshot = await firestore.collection("donations").get();
    const donations = donationSnapshot.docs.map((doc) => ({
      id: doc.id,
      donorId: doc.data().donorId,
      amount: doc.data().amount,
    }));

    const donorsWithDonations = donors.map((donor) => {
      const donorDonations = donations.filter((donation) => donation.donorId === donor.id);
      return {
        ...donor,
        totalDonation: donorDonations.reduce((sum, donation) => sum + donation.amount, 0),
        donations: donorDonations, 
      };
    });

    res.status(200).json({ donors: donorsWithDonations });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu nhà tài trợ:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
});

export default donorRouters;
