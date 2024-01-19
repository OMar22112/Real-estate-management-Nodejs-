import db from "../db.js";
import bcrypt from "bcryptjs";

export const editUser = async (req, res) => {
    const userId = req.params.userId;
    const { username, email, password, phone_no, image, description } = req.body;

    try {
        // Check if the user exists
        const userExist = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

        if (userExist.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password && password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const updatedUser = {
            username: username || userExist[0].username,
            email: email || userExist[0].email,
            phone_no: phone_no || userExist[0].phone_no,
            image: image || userExist[0].image,
            description: description || userExist[0].description,
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            updatedUser.password = hashedPassword;
        }

        await db.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId]);

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
