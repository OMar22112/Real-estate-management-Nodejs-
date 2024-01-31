import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const userSearchForProperty = async (req, res) => {
    try {
        const { id, name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status } = req.query;
        const userId = req.user.userId; // Extracted user ID from the token
        const conditions = [`user_id = ${userId}`]; // Only properties associated with the user

        if (id) conditions.push(`id = ${parseInt(id)}`);
        if (name) conditions.push(`name LIKE '%${name}%'`);
        if (type) conditions.push(`type LIKE '%${type}%'`);
        if (rooms) conditions.push(`rooms = ${parseInt(rooms)}`);
        if (bedroom) conditions.push(`bedroom = ${parseInt(bedroom)}`);
        if (bathroom) conditions.push(`bathroom = ${parseInt(bathroom)}`);
        if (livings) conditions.push(`livings = ${parseInt(livings)}`);
        if (space) conditions.push(`space = ${parseInt(space)}`);
        if (has_garden !== undefined) conditions.push(`has_garden = ${parseInt(has_garden)}`);
        if (price) conditions.push(`price = ${parseFloat(price)}`);
        if (status !== undefined) conditions.push(`status = ${parseInt(status)}`);

        let query = "SELECT * FROM properties";

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        db.query(query, async (err, rows) => {
            if (!err) {
                // Map through the rows and modify the image field
                const sanitizedRows = await Promise.all(rows.map(async (property) => {
                    return {
                        ...property,
                        images: property.images ? await getImageUrls('images', req, property.images) : null,
                    };
                }));

                res.json(sanitizedRows);
            } else {
                console.log(err);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Function to get the image URLs based on the image data from Firebase Storage
export const getImageUrls = async (storagePath, req, imageDataArray) => {
    try {
        const storage = getStorage();
        const imageUrls = await Promise.all(imageDataArray.map(async (imageData) => {
            const imageRef = ref(storage, `${storagePath}/${imageData}`);
            return await getDownloadURL(imageRef);
        }));
        return imageUrls;
    } catch (error) {
        console.error(`Error generating image URLs for ${storagePath}:`, error);
        return null;
    }
};
