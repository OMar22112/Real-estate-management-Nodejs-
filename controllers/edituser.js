import db from "../db.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import { getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const editUser = (req, res) => {
    const userId = req.params.userId;
    const { username, email, password, phone_no, description } = req.body;

    upload.single('image')(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error uploading file" });
        }

        // Check if the user exists
        db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            if (password && password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            const existingUser = results[0];

            const updatedUser = {
                username: username || existingUser.username,
                email: email || existingUser.email,
                phone_no: phone_no || existingUser.phone_no,
                description: description || existingUser.description,
            };

            if (password) {
                bcrypt.hash(password, 8, async (hashErr, hashedPassword) => {
                    if (hashErr) {
                        console.error(hashErr);
                        return res.status(500).json({ message: "Internal Server Error" });
                    }

                    updatedUser.password = hashedPassword;
                    await updateUser();
                });
            } else {
                await updateUser();
            }

            async function updateUser() {
                if (req.file) {
                    // Delete the existing image from storage
                    const storage = getStorage();
                    const existingImageRef = ref(storage, 'userimages/' + existingUser.image);
                    await deleteObject(existingImageRef);

                    // Upload the new image
                    const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
                    const storageRef = ref(storage, 'userimages/' + filename);
                    await uploadBytes(storageRef, req.file.buffer);

                    updatedUser.image = filename;
                } else {
                    updatedUser.image = existingUser.image;
                }

                // Update the user in the database
                db.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId], (updateErr) => {
                    if (updateErr) {
                        console.error(updateErr);
                        return res.status(500).json({ message: "Internal Server Error" });
                    }

                    res.json({ message: "User updated successfully" });
                });
            }
        });
    });
};
