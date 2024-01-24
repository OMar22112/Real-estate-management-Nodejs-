import db from "../db.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from 'path';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { initializeApp } from "firebase/app";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const editUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { username, email, password, phone_no, description } = req.body;

        // Check if the user exists
        const existingUser = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE id = ?', [userId], async (error, results) => {
                if (error) {
                    console.error('Error checking existing user:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (existingUser.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password && password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const updatedUser = {
            username: username || existingUser[0].username,
            email: email || existingUser[0].email,
            phone_no: phone_no || existingUser[0].phone_no,
            description: description || existingUser[0].description,
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            updatedUser.password = hashedPassword;
        }

        // If a new image is provided, upload it to Firebase Storage
        if (req.file) {
            const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
            const storage = getStorage();
            const storageRef = ref(storage, 'userimages/' + filename);
            const snapshot = await uploadBytes(storageRef, req.file.buffer);
            updatedUser.image = filename; // Update the image filename in the database

            // If the user had an existing image, delete it from Firebase Storage
            if (existingUser[0].image) {
                const oldStorageRef = ref(storage, 'userimages/' + existingUser[0].image);
                await deleteObject(oldStorageRef);
            }
        }

        // Use async/await with the db.query function
        await new Promise((resolve, reject) => {
            db.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId], (error, results) => {
                if (error) {
                    console.error('Error updating user:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Add the upload middleware to handle file uploads

