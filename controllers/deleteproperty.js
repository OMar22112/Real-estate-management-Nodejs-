import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;

        if (!propertyId) {
            return res.status(400).json({ error: 'Property ID is required.' });
        }

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

        // Get the image associated with the property
        const existingImage = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM images WHERE property_id = ?', [propertyId], async (error, results) => {
                if (error) {
                    console.error('Error checking existing image:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (existingImage.length === 0) {
            return res.status(404).json({ message: "Image not found for the specified property" });
        }

        // Delete image from Firebase Storage
        const imageId = existingImage[0].id;
        const imageFilename = existingImage[0].image_filename;
        const storage = getStorage();
        const storageRef = ref(storage, 'images/' + imageFilename);
        await deleteObject(storageRef);

        // Delete image data from the 'images' table
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM images WHERE id = ?', [imageId], (error, results) => {
                if (error) {
                    console.error('Error deleting image from the database:', error);
                    reject(error);
                } else {
                    console.log('Deleted image from the database:', imageId);
                    resolve(results);
                }
            });
        });

        // Delete property data from the 'properties' table
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM properties WHERE id = ?', [propertyId], (error, results) => {
                if (error) {
                    console.error('Error deleting property from the database:', error);
                    reject(error);
                } else {
                    console.log('Deleted property from the database:', propertyId);
                    resolve(results);
                }
            });
        });

        res.status(200).json({ message: 'Property and associated image deleted successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
