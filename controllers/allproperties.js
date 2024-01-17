// Import necessary modules
import db from '../db.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Controller function to get all properties with images and user information
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
    
        const properties = await db.query(propertiesQuery);

        // Log the properties to the console
        console.log('Properties:', properties);
    
        // Fetch and append image URLs to the result
        const propertiesWithImageUrls = await Promise.all((properties._results || []).map(async property => {
            const imageUrl = property.image_filename
                ? await getDownloadURL(ref(getStorage(), `images/${property.image_filename}`), false)
                : null;
    
            return { ...property, imageUrl };
        }));
    
        res.status(200).json(propertiesWithImageUrls);
    } catch (error) {
        console.error('Error retrieving properties:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
