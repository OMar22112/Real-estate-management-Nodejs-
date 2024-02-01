import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const propertiesByField = async (req, res) => {
    try {
        const { id, name, type, rooms, bedroom, bathroom, livings, space, has_garden, price, status } = req.query;
        const conditions = [];

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

        const rows = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const sanitizedRows = await Promise.all(rows.map(async (property) => {
            // Function to get the image URLs based on the image data from Firebase Storage
            const getImageUrls = async (propertyId) => {
                try {
                    const imageQuery = `SELECT image_filename FROM images WHERE property_id = ${propertyId}`;
                    const imageRows = await new Promise((resolve, reject) => {
                        db.query(imageQuery, (err, result) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    });

                    const storage = getStorage();
                    const imageUrls = await Promise.all(imageRows.map(async (imageRow) => {
                        const imageRef = ref(storage, `images/${imageRow.image_filename}`);
                        return getDownloadURL(imageRef);
                    }));

                    return imageUrls;
                } catch (error) {
                    console.error(`Error generating image URLs:`, error);
                    return null;
                }
            };

            return {
                ...property,
                images: property.id ? await getImageUrls(property.id) : null,
            };
        }));

        res.json(sanitizedRows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
