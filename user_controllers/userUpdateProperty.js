import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import db from '../db.js';
import firebaseConfig from '../config/firebaseConfig.js';
import path from 'path';
import multer from 'multer';
import bcrypt from 'bcryptjs';

initializeApp(firebaseConfig);

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const userEditProperties = async (req, res) => {
  try {
    // Use userId directly from req.user
    const userId = req.user.userId;

    const propertyId = req.params.propertyId;
    const { name, type, rooms, bedroom, bathroom, livings, space, has_garden, price } = req.body;

    // Check if the property exists for the given user
    const existingProperty = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM properties WHERE id = ? AND user_id = ?', [propertyId, userId], async (error, results) => {
        if (error) {
          console.error('Error checking existing property:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (existingProperty.length === 0) {
      return res.status(404).json({ message: 'Property not found for the authenticated user' });
    }

    console.log('Existing Property:', existingProperty[0]);

    // Update property data in the database
    const updatedProperty = {
      name: name || existingProperty[0].name,
      type: type || existingProperty[0].type,
      rooms: rooms || existingProperty[0].rooms,
      bedroom: bedroom || existingProperty[0].bedroom,
      bathroom: bathroom || existingProperty[0].bathroom,
      livings: livings || existingProperty[0].livings,
      space: space || existingProperty[0].space,
      has_garden: has_garden || existingProperty[0].has_garden,
      price: price || existingProperty[0].price,
    };

    // Use async/await with the db.query function to update property data
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE properties SET ? WHERE id = ? AND user_id = ?',
        [updatedProperty, propertyId, userId],
        (error, results) => {
          if (error) {
            console.error('Error updating property:', error);
            reject(error);
          } else {
            console.log('Property updated successfully');
            resolve(results);
          }
        }
      );
    });

    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
