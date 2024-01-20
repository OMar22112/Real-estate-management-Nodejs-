import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import db from "../db.js";
import firebaseConfig from '../config/firebaseConfig.js';

initializeApp(firebaseConfig);

const baseUrl = 'https://your-image-base-url.com/';

export const getAllPropertiesByUserId = async (req, res) => {
  try {
    // Extract user ID from the authenticated user
    const userId = req.user.userId;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;

    // Fetch properties added by the user with the given user ID with pagination
    const propertiesQuery = `
      SELECT properties.id, properties.name, properties.type, properties.rooms, properties.bedroom, properties.bathroom, properties.livings, properties.space, properties.has_garden, properties.price, properties.status, properties.user_id, user.username AS user_username, user.type AS user_type, properties.created_at, GROUP_CONCAT(images.image_filename) AS image_filenames
      FROM properties
      LEFT JOIN users AS user ON properties.user_id = user.id
      LEFT JOIN images ON properties.id = images.property_id
      WHERE properties.user_id = ?
      GROUP BY properties.id
      LIMIT ?, ?
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM properties WHERE user_id = ?';

    const [propertiesResult, countResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(propertiesQuery, [userId, offset, pageSize], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(countQuery, [userId], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      }),
    ]);

    const totalProperties = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalProperties / pageSize);

    // Fetch associated images for the fetched properties
    const imageResults = await new Promise((resolve, reject) => {
      db.query("SELECT property_id, image_filename FROM images WHERE property_id IN (?)", [propertiesResult.map(property => property.id)], (err, results) => {
        if (err) {
          console.error('Error fetching images for properties from the database:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Create a map of property_id to image_urls
    const imageMap = imageResults.reduce((acc, result) => {
      const imageUrl = `${baseUrl}/images/${result.image_filename}`;
      if (!acc[result.property_id]) {
        acc[result.property_id] = [imageUrl];
      } else {
        acc[result.property_id].push(imageUrl);
      }
      return acc;
    }, {});

    // Attach the image URLs array to the property object
    const propertiesWithImages = propertiesResult.map(property => ({
      ...property,
      imageUrls: imageMap[property.id] || [],
    }));

    res.status(200).json({
      properties: propertiesWithImages,
      pageInfo: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalProperties,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
