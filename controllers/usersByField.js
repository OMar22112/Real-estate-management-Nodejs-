import db from "../db.js";

export const usersByField = async (req, res) => {
    try {
        const { id, username, email, phone } = req.query;
        const conditions = [];

        if (id) conditions.push(`id = ${parseInt(id)}`);
        if (username) conditions.push(`username = '${username}'`);
        if (email) conditions.push(`email = '${email}'`);
        if (phone) conditions.push(`phone = '${phone}'`);

        let query = "SELECT * FROM users";

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        db.query(query, (err, rows) => {
            if (!err) {
                // Map through the rows and modify the image field
                const sanitizedRows = rows.map((user) => {
                    return {
                        ...user,
                        image: user.image ? getImageUrl(req, user.image) : null,
                    };
                });

                //console.log(sanitizedRows);
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

// Function to get the image URL based on the image data
const getImageUrl = (req, imageData) => {
    // Assuming you have a function to generate the image URL from the image data
    // Replace the following line with the actual logic for getting the image URL
    const imageUrl = generateImageUrl(req, imageData);

    return imageUrl;
};

// Replace this function with the actual logic for generating the image URL
const generateImageUrl = (req, imageData) => {
    // Your logic to generate the image URL based on the image data
    // For example, if images are stored on the server, you can construct the URL
    // For now, let's assume the image data is a file name
    return `${req.protocol}://${req.get('host')}/uploads/${imageData}`;
};
