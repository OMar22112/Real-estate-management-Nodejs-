import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const addImageOfProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Validate if the property exists
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

    // Validate image upload (min 1 image, max 5 images)
    const images = req.files;
    if (!images || images.length < 1 || images.length > 5) {
      return res.status(400).json({ error: 'You must upload between 1 and 5 images.' });
    }

    const imageInsertPromises = images.map(async image => {
      const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + '_' + image.originalname;
      const storage = getStorage();
      const storageRef = ref(storage, 'images/' + filename);
      const snapshot = await uploadBytes(storageRef, image.buffer);
      const imageUrl = await getDownloadURL(snapshot.ref, false);

      // Insert image data into the 'images' table
      const imageInsertResult = await new Promise((resolve, reject) => {
        db.query("INSERT INTO images SET ?", {
          property_id: propertyId,
          image_filename: filename
        }, (err, result) => {
          if (err) {
            console.error('Error inserting image into the database:', err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return { imageUrl };
    });

    // Wait for all image insertions to complete
    const imageInsertResults = await Promise.all(imageInsertPromises);

    res.status(201).json({ message: 'Images added to property successfully', imageInsertResults });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
