import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from '../db.js';
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const addProperties = async (req, res) => {
  try {
    const { name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status } = req.body;

    // Extract admin ID from the authenticated user
    const adminId = req.user.userId;

    // Create a unique filename (you can use any logic for generating a unique filename)
    const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + '_' + req.file.originalname;

    // Get the Firebase Storage reference
    const storage = getStorage();

    // Create a reference to the storage bucket (change 'images' to your desired folder name)
    const storageRef = ref(storage, 'images/' + filename);

    // Upload image to Firebase Cloud Storage
    const snapshot = await uploadBytes(storageRef, req.file.buffer);

    // Get the download URL for the uploaded image
    const imageUrl = await getDownloadURL(snapshot.ref);

    // Insert property data into the database with the associated admin ID and image filename
    await db.query(
      'INSERT INTO properties (name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, image, status, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, filename, status, adminId]
    );

    // Respond with a success message and the generated URL
    res.status(201).json({ message: 'Property added successfully', imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
