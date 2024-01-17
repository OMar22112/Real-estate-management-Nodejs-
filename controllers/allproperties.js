// Import necessary modules
import db from '../db.js';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Function to fetch image URLs
const fetchImageURLs = async (imageFilenames) => {
    const storage = getStorage();
    const imageURLs = await Promise.all(imageFilenames.map(async (filename) => {
        return {
            filename: filename,
            url: await getDownloadURL(ref(storage, `images/${filename}`), false)
        };
    }));
    return imageURLs;
};

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
        a.username AS added_by_username,
        'admin' AS added_by_type
    FROM properties p
    LEFT JOIN images i ON p.id = i.property_id
    LEFT JOIN admins a ON p.admin_id = a.id
    WHERE p.user_id IS NULL
    
    UNION ALL
    
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
        u.username AS added_by_username,
        'user' AS added_by_type
    FROM properties p
    LEFT JOIN images i ON p.id = i.property_id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.admin_id IS NULL;
    
        `;

        const propertiesResult = await db.query(propertiesQuery);

        // Extract image filenames
        const imageFilenames = propertiesResult.map((property) => property.image_filename).filter(Boolean);

        // Fetch image URLs
        const imageUrls = await fetchImageURLs(imageFilenames);

        // Combine properties with image URLs
        const propertiesWithImageUrls = propertiesResult.map((property) => {
            const matchingImages = imageUrls.filter((img) => img.filename === property.image_filename);
            const imageUrl = matchingImages.length > 0 ? matchingImages[0].url : null;

            return {
                ...property,
                imageUrl
            };
        });

        res.status(200).json(propertiesWithImageUrls);
    } catch (error) {
        console.error('Error retrieving properties:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
