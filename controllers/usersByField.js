import db from "../db.js";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const usersByField = async (req, res) => {
    try {
        const { id, username, email, phone } = req.query;
        const conditions = [];

        if (id) conditions.push(`id = ${parseInt(id)}`);
        if (username) conditions.push(`username = '${username}'`);
        if (email) conditions.push(`email = '${email}'`);
        if (phone) conditions.push(`phone_no = '${phone}'`);

        let query = "SELECT * FROM users";

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        db.query(query, async (err, rows) => {
            if (!err) {
                // Map through the rows and modify the image field
                const sanitizedRows = await Promise.all(rows.map(async (user) => {
                    return {
                        ...user,
                        image: user.image ? await getImageUrl(req, user.image) : null,
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

// Function to get the image URL based on the image data from Firebase Storage
const getImageUrl = async (req, imageData) => {
    try {
        const storage = getStorage();
        const imageRef = ref(storage, 'userimages/' + imageData);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
    } catch (error) {
        console.error('Error generating image URL:', error);
        return null;
    }
};
