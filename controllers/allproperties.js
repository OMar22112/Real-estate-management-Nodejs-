import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const baseUrl = 'https://your-image-base-url.com/';

export const getAllProperties = async (req, res) => {
  try {
    // Fetch all properties from the 'properties' table
    const properties = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM properties", (err, results) => {
        if (err) {
          console.error('Error fetching properties from the database:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // If there are no properties, return an empty array
    if (properties.length === 0) {
      return res.status(404).json({ message: 'No properties found' });
    }

    // Iterate through each property to fetch associated images with full URLs
    const propertiesWithImages = await Promise.all(properties.map(async (property) => {
      // Fetch images for the current property from the 'images' table
      const images = await new Promise((resolve, reject) => {
        db.query("SELECT image_filename FROM images WHERE property_id = ?", [property.id], (err, results) => {
          if (err) {
            console.error('Error fetching images for property from the database:', err);
            reject(err);
          } else {
            const imageUrls = results.map(async (result) => {
              const imageUrl = await generateImageUrl(result.image_filename);
              return imageUrl;
            });
            resolve(imageUrls);
          }
        });
      });

      // Attach the image URLs array to the property object
      return {  imageUrls: await Promise.all(images) };
    }));

    res.status(200).json({ properties: propertiesWithImages });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to generate image URL based on filename
const generateImageUrl = async (filename) => {
  const storage = getStorage();
  const storageRef = ref(storage, 'images/' + filename);
  const imageUrl = await getDownloadURL(storageRef);
  return baseUrl + imageUrl;
};
