import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const baseUrl = 'https://your-image-base-url.com/';

export const getAllProperties = async (req, res) => {
  try {
    // Fetch all properties from the 'properties' table
    const properties = await new Promise((resolve, reject) => {
      db.query("SELECT properties.id, properties.name, ..., GROUP_CONCAT(images.image_filename) AS image_filenames FROM properties LEFT JOIN admins AS admin ON properties.admin_id = admin.id LEFT JOIN images ON properties.id = images.property_id GROUP BY properties.id;", (err, results) => {
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

    // Fetch associated images for all properties
    const imageResults = await new Promise((resolve, reject) => {
      db.query("SELECT property_id, image_filename FROM images WHERE property_id IN (?)", [properties.map(property => property.id)], (err, results) => {
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
    const propertiesWithImages = properties.map(property => ({
      ...property,
      imageUrls: imageMap[property.id] || [],
    }));

    res.status(200).json({ properties: propertiesWithImages });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
