import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

export const addProperties = async (req, res) => {
  try {
    const { name, type, rooms, bedroom, bathroom, livings, space, price } = req.body;

    const has_garden = parseInt(req.body.has_garden) ;
    const status = parseInt(req.body.status) || 0;

    // Extract admin ID from the authenticated user
    const adminId = req.user.userId;

    // Validate required fields
    const requiredFields = [name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status];
    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      return res.status(400).json({ error: 'All fields except are required.' });
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
        admin_id: adminId,
        user_id: null
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











// import { initializeApp } from "firebase/app";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import db from "../db.js";
// import firebaseConfig from '../config/firebaseConfig.js';

// initializeApp(firebaseConfig);

// export const addProperties = async (req, res) => {
//   try {
//     const { name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status } = req.body;

//     // Extract admin ID from the authenticated user
//     const adminId = req.user.userId;

//     // Create a unique filename (you can use any logic for generating a unique filename)
//     const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + '_' + req.file.originalname;

//     // Get the Firebase Storage reference
//     const storage = getStorage();

//     // Create a reference to the storage bucket (change 'images' to your desired folder name)
//     const storageRef = ref(storage, 'images/' + filename);

//     // Upload image to Firebase Cloud Storage
//     const snapshot = await uploadBytes(storageRef, req.file.buffer);

//     // Get the download URL for the uploaded image
//     const imageUrl = await getDownloadURL(snapshot.ref, false);

//     // Insert property data into the database with the associated admin ID and image filename
//     const prop = await db.query("INSERT INTO properties SET ?", {
//       name: name,
//       type: type,
//       rooms: rooms,
//       bedroom: bedroom,
//       bathroom: bathroom,
//       livings: livings,
//       space: space,
//       has_garden: has_garden,
//       price: price,
//       image_filename: filename,
//       status: status,
//       admin_id: adminId,
//       user_id: null // Assuming user_id is nullable or you need to provide a value
//   });

//     // Check the result of the database insertion
//     //console.log('Database Insert Result:', insertResult);

//     // Respond with a success message and the generated URL
//     res.status(201).json({ message: 'Property added successfully', imageUrl, prop });
//   } catch (error) {
//     console.error('Error adding property:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// DROP TABLE IF EXISTS images;
// DROP TABLE IF EXISTS properties;
// CREATE TABLE images (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   property_id INT NOT NULL,
//   image_filename VARCHAR(255) NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (property_id) REFERENCES properties(id)
// );

// CREATE TABLE properties (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   name VARCHAR(255) NOT NULL,
//   type VARCHAR(255) NOT NULL,
//   rooms INT NOT NULL,
//   bedroom INT NOT NULL,
//   bathroom INT NOT NULL,
//   livings INT NOT NULL,
//   space INT NOT NULL,
//   has_garden BOOLEAN NOT NULL,
//   price DECIMAL(10, 2) NOT NULL,
//   status BOOLEAN NOT NULL,
//   admin_id INT,
//   user_id INT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (admin_id) REFERENCES admins(id),
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
