import { getStorage, ref, deleteObject } from "firebase/storage";
import db from "../db.js";

export const deleteProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required.' });
    }

    // Delete images associated with the property from Firebase Storage
    const deleteImagesResult = await deleteImagesForProperty(propertyId);

    // Delete property from the database
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM properties WHERE id = ?", [propertyId], (err, result) => {
        if (err) {
          console.error('Error deleting property from the database:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).json({ message: 'Property and associated images deleted successfully', deleteImagesResult });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Helper function to delete images for a property
const deleteImagesForProperty = async (propertyId) => {
  return new Promise(async (resolve, reject) => {
    const storage = getStorage();
    const imagesRef = ref(storage, 'images/');

    // Get a list of images for the property
    const imagesSnapshot = await getImagesForPropertyFromDatabase(propertyId);

    // Delete each image from Firebase Storage
    const deleteImagePromises = imagesSnapshot.map(async (image) => {
      const filename = image.image_filename;
      const imageRef = ref(imagesRef, filename);

      try {
        await deleteObject(imageRef);
        return { filename: filename, success: true };
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        return { filename: filename, success: false };
      }
    });

    // Wait for all image deletions to complete
    const deleteImageResults = await Promise.all(deleteImagePromises);
    resolve(deleteImageResults);
  });
};

// Helper function to get images for a property from the database
const getImagesForPropertyFromDatabase = async (propertyId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM images WHERE property_id = ?", [propertyId], (err, result) => {
      if (err) {
        console.error('Error fetching images for property from the database:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
