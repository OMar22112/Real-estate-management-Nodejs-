import { initializeApp } from "firebase/app";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const editPropertyStatus = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const { status } = req.body;

    // Check if the property exists
    const existingProperty = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM properties WHERE id = ?', [propertyId], async (error, results) => {
        if (error) {
          console.error('Error checking existing property:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (existingProperty.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    console.log('Existing Property:', existingProperty[0]);

    // Update property data in the database
    const updatedProperty = {
      status: status || existingProperty[0].status,
    };

    // Use async/await with the db.query function to update property data
    await new Promise((resolve, reject) => {
      db.query("UPDATE properties SET ? WHERE id = ?", [updatedProperty, propertyId], (error, results) => {
        if (error) {
          console.error('Error updating property:', error);
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
