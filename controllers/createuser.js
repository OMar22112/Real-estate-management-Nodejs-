import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const createUser = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm, phone_no, description } = req.body;

    // Fields required
    if (!username || !email || !password || !passwordConfirm || !phone_no || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email and phone_no exist
    const existingUser = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ? AND phone_no = ?', [email, phone_no], (error, results) => {
        if (error) {
          console.error('Error checking existing user:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email or Phone number already exists' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
    const storage = getStorage();
    const storageRef = ref(storage, 'images/' + filename);
    const snapshot = await uploadBytes(storageRef, req.file.buffer);
    const imageUrl = await getDownloadURL(snapshot.ref, false);

    await db.query("INSERT INTO users SET ?", {
      username: username,
      email: email,
      password: hashedPassword,
      phone_no: phone_no,
      image: filename, // Save the filename in the database
      description: description
    });

    res.status(201).json({ message: "Registration successful", imageUrl });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add the upload middleware to handle file uploads
// export const uploadImage = upload.single('image');
