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
      try {
        const imageUrl = property.image_filename
          ? await getImageUrl(req, property.image_filename)
          : null;

        return { ...property, imageUrl };
      } catch (error) {
        console.error('Error getting image URL for property:', property.property_id, error);
        return { ...property, imageUrl: null };
      }
    }));

    // Create a new object without circular references
    const sanitizedProperties = propertiesWithImageUrls.map(property => {
      // Extract only the necessary properties from the db object
      const { property_id, name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status, image_id, image_filename, image_created_at, added_by_username, added_by_type } = property;
      
      return {
        property_id,
        name,
        type,
        rooms,
        bedroom,
        bathroom,
        livings,
        space,
        has_garden,
        price,
        status,
        image_id,
        image_filename,
        image_created_at,
        added_by_username,
        added_by_type,
      };
    });

    res.status(200).json(sanitizedProperties);
  } catch (error) {
    console.error('Error retrieving properties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get the image URL based on the image filename
const getImageUrl = async (req, imageFilename) => {
  try {
    const imageUrl = await getDownloadURL(ref(getStorage(), `images/${imageFilename}`), false);
    return imageUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
