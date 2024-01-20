import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const userAddProperties = async (req, res) => {
  try {
    const { name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status } = req.body;

    // Extract admin ID from the authenticated user
    const userId = req.user.userId; 

    // Validate required fields
    const requiredFields = [name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status];
    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate image upload (min 1 image, max 5 images)
    const images = req.files;
    if (!images || images.length < 1 || images.length > 5) {
      return res.status(400).json({ error: 'You must upload between 1 and 5 images.' });
    }

    // Insert property data into the database with the associated admin ID
    const propertyInsertResult = await new Promise((resolve, reject) => {
      db.query("INSERT INTO properties SET ?", {
        name: name,
        type: type,
        rooms: rooms,
        bedroom: bedroom,
        bathroom: bathroom,
        livings: livings,
        space: space,
        has_garden: has_garden,
        price: price,
        status: status,
        admin_id: null,
        user_id: userId
      }, (err, result) => {
        if (err) {
          console.error('Error inserting property into the database:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const propertyId = propertyInsertResult.insertId;
    console.log('Inserted property with ID:', propertyId);

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

      return { insertId: imageInsertResult.insertId, imageUrl: imageUrl };
    });

    // Wait for all image insertions to complete
    const imageInsertResults = await Promise.all(imageInsertPromises);

    res.status(201).json({ message: 'Property added successfully with images', imageInsertResults });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};