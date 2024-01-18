import db from "../db.js";

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

    // Iterate through each property to fetch associated images
    const propertiesWithImages = await Promise.all(properties.map(async (property) => {
      // Fetch images for the current property from the 'images' table
      const images = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM images WHERE property_id = ?", [property.id], (err, results) => {
          if (err) {
            console.error('Error fetching images for property from the database:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      // Attach the images array to the property object
      return { ...property, images };
    }));

    res.status(200).json({ properties: propertiesWithImages });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
