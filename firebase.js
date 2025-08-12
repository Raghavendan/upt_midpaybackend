// backend/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

dotenv.config();

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Get the database reference
const database = admin.database();

// Functions to mimic your old usage
const ref = (path) => database.ref(path);
const get = async (refObj) => {
  const snapshot = await refObj.once("value");
  return snapshot;
};
const set = async (refObj, value) => {
  await refObj.set(value);
};

export { database, ref, get, set };
