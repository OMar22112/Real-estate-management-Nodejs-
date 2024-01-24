import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';
import path from 'path';
import multer from "multer";
import bcrypt from "bcryptjs";

initializeApp(firebaseConfig);

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const editProperties = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const { name, type, rooms, bedroom, bathroom, livings, space, has_garden, price } = req.body;

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

    // Validate image upload (min 1 image, max 5 images)
    // const images = req.files;
    // if (images && (images.length < 1 || images.length > 5)) {
    //   return res.status(400).json({ error: 'You must upload between 1 and 5 images.' });
    // }

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

    // If images are provided, update images in the database
    // if (images) {
    //   // Delete existing images associated with the property from Firebase Storage
    //   const existingImagePromises = existingProperty.map(async property => {
    //     if (property.image_filename) {
    //       const oldStorageRef = ref(getStorage(), 'images/' + property.image_filename);
    //       await deleteObject(oldStorageRef);
    //       console.log('Deleted existing image:', property.image_filename);
    //     }
    //   });

    //   await Promise.all(existingImagePromises);

    //   // Insert new images into Firebase Storage and update the 'images' table
    //   const imageInsertPromises = images.map(async image => {
    //     const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + '_' + image.originalname;
    //     const storageRef = ref(getStorage(), 'images/' + filename);
    //     const snapshot = await uploadBytes(storageRef, image.buffer);
    //     const imageUrl = await getDownloadURL(snapshot.ref, false);

    //     Insert image data into the 'images' table
    //     const imageInsertResult = await new Promise((resolve, reject) => {
    //       db.query("INSERT INTO images SET ?", {
    //         property_id: propertyId,
    //         image_filename: filename
    //       }, (err, result) => {
    //         if (err) {
    //           console.error('Error inserting image into the database:', err);
    //           reject(err);
    //         } else {
    //           resolve(result);
    //         }
    //       });
    //     });

    //     console.log('Inserted new image:', filename);

    //     return { insertId: imageInsertResult.insertId, imageUrl: imageUrl };
    //   });

      // Wait for all image insertions to complete
    //   const imageInsertResults = await Promise.all(imageInsertPromises);
    //   console.log('Image Insert Results:', imageInsertResults);
    // }

    // Use async/await with the db.query function to update property data
    await new Promise((resolve, reject) => {
      db.query("UPDATE properties SET ? WHERE id = ?", [updatedProperty, propertyId], (error, results) => {
        if (error) {
          console.error('Error updating property:', error);
          reject(error);
        } else {
          console.log('Property updated successfully');
          resolve(results);
        }
      });
    });

    res.json({ message: "Property updated successfully" });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
