import { getStorage, ref, getDownloadURL } from "firebase/storage";
import firebaseConfig from '../config/firebaseConfig.js';
import { initializeApp } from "firebase/app";
import db from "../db.js";



// Initialize Firebase
initializeApp(firebaseConfig);

// Function to get the image URL based on the image data from Firebase Storage
const getImageUrl = async (imageData) => {
  try {
    const storage = getStorage();
    const imageRef = ref(storage, 'userimages/' + imageData);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

export const showAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as total FROM users`;

    const [dataResult, countResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(dataQuery, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(countQuery, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      }),
    ]);

    const totalUsers = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Map through the rows and modify the image field
    const sanitizedRows = await Promise.all(dataResult.map(async (user) => {
      return {
        ...user,
        image: user.image ? await getImageUrl(user.image) : null,
      };
    }));

    res.json({
      users: sanitizedRows,
      pageInfo: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// -- Drop the existing "users" table if it exists
// DROP TABLE IF EXISTS users;

// -- Create the new "users" table
// CREATE TABLE users (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     username VARCHAR(255),
//     email VARCHAR(255),
//     password VARCHAR(255),
//     phone_no VARCHAR(15),
//     image LONGBLOB,
//     description TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
