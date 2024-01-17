import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const getAllProperties = async (req, res) => {
  try {
    const propertiesQuery = `
      SELECT
        p.id AS property_id,
        p.name,
        p.type,
        p.rooms,
        p.bedroom,
        p.bathroom,
        p.livings,
        p.space,
        p.has_garden,
        p.price,
        p.status,
        i.id AS image_id,
        i.image_filename,
        i.created_at AS image_created_at,
        COALESCE(a.username, u.username) AS added_by_username,
        COALESCE(a.type, 'user') AS added_by_type
      FROM properties p
      LEFT JOIN images i ON p.id = i.property_id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN admins a ON p.admin_id = a.id
    `;
    
    const propertiesResult = await db.query(propertiesQuery);

    // Ensure propertiesResult is an array
    const propertiesArray = Array.isArray(propertiesResult) ? propertiesResult : [propertiesResult];

    // Fetch and append image URLs to the result
    const propertiesWithImageUrls = await Promise.all(propertiesArray.map(async property => {
      const imageUrl = property.image_filename
        ? await getImageUrl(req, property.image_filename)
        : null;

      return { ...property, imageUrl };
    }));

    // Create a new object without circular references
    const sanitizedProperties = propertiesWithImageUrls.map(property => {
      const sanitizedProperty = { ...property };
      // Exclude properties that lead to circular references
      delete sanitizedProperty._object;
      delete sanitizedProperty._timer;
      return sanitizedProperty;
    });

    res.status(200).json(sanitizedProperties);
  } catch (error) {
    console.error('Error retrieving properties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get the image URL based on the image filename
const getImageUrl = async (req, imageFilename) => {
  const imageUrl = await getDownloadURL(ref(getStorage(), `images/${imageFilename}`), false);
  return imageUrl;
};
