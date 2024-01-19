import db from "../db.js";
import bcrypt from "bcryptjs";

export const editUser = async (req, res) => {
    const userId = req.params.userId;
    const { username, email, password, phone_no, image, description } = req.body;

    try {
        // Check if user exists
        const userExist = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (userExist.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        let updatedUser = {
            username: username || userExist[0].username,
            email: email || userExist[0].email,
            phone_no: phone_no || userExist[0].phone_no,
            image: image || userExist[0].image,
            description: description || userExist[0].description,
        };

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            const hashedPassword = await bcrypt.hash(password, 8);
            updatedUser.password = hashedPassword;
        }

        // Establish a new connection
        const connection = db.getConnection();

        // Start a transaction
        await connection.beginTransaction();

        // Update user
        await connection.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId]);

        // Commit the transaction
        await connection.commit();

        // Release the connection back to the pool
        connection.release();

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);

        // If an error occurs, roll back the transaction and release the connection
        await connection.rollback();
        connection.release();

        res.status(500).json({ message: "Internal Server Error" });
    }
};
