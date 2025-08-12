import express from "express";
import fetch from "node-fetch";
import CryptoJS from "crypto-js";
import { database, ref, get } from "../firebase.js";

const router = express.Router();

// Helper: Encrypt payload
const encryptTransaction = (payload) => {
  const key = CryptoJS.enc.Utf8.parse(payload.AuthKey.padEnd(32, "0"));
  const iv = CryptoJS.enc.Utf8.parse(payload.AuthKey.substring(0, 16));

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};

// POST - Seamless Payment Initiation
router.post("/initiate", async (req, res) => {
  try {
    const { username, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Fetch user details from Firebase
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const usersData = snapshot.val();
    const matchedUser = Object.values(usersData).find(u => u.name === username);

    if (!matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare transaction data
    const custRefNo = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
    const paymentDate = new Date().toISOString().replace("T", " ").substring(0, 19);

    const payload = {
      AuthID: "M00006572",
      AuthKey: "Qv0rg4oN8cS9sm6PS3rr6fu7MN2FB0Oo",
      CustRefNum: custRefNo,
      txn_Amount: amount,
      PaymentDate: paymentDate,
      ContactNo: matchedUser.mobile,
      EmailId: matchedUser.email,
      CallbackURL: "https://nonseam-pay.onrender.com/transaction",
      IntegrationType: "seamless",
      adf1: "NA",
      adf2: "NA",
      adf3: "NA",
      MOP: "UPI",
      MOPType: "UPI",
      MOPDetails: "I",
    };

    // Encrypt
    const encryptedData = encryptTransaction(payload);

    // Send to payment gateway
    const response = await fetch("https://dashboard.skill-pay.in/pay/paymentinit", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        AuthID: payload.AuthID,
        encData: encryptedData,
      }),
    });

    const result = await response.text();

    // Send HTML/response back to frontend
    res.send(result);

  } catch (error) {
    console.error("❌ Payment Initiation Error:", error);
    res.status(500).json({ error: "Payment request failed" });
  }
});

export default router;
