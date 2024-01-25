import { initializeApp } from "firebase/app";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const editPropertyStatus = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const { status } = req.body;

    // Parse status as integer (0 or 1)
    const parsedStatus = parseInt(status) || 0;

    // Use async/await with the db.query function to update property status
    await new Promise((resolve, reject) => {
      db.query("UPDATE properties SET status = ? WHERE id = ?", [parsedStatus, propertyId], (error, results) => {
        if (error) {
          console.error('Error updating property status:', error);
          reject(error);
        } else {
          console.log('Property status updated successfully');
          resolve(results);
        }
      });
    });

    res.json({ message: "Property status updated successfully" });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
