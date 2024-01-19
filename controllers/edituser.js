import db from "../db.js";
import bcrypt from "bcryptjs";

export const editUser = async (req, res) => {
    const userId = req.params.userId;
    const { username, email, password, phone_no, image, description } = req.body;

    // Check if the user exists
    db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password && password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const updatedUser = {
            username: username || results[0].username,
            email: email || results[0].email,
            phone_no: phone_no || results[0].phone_no,
            image: image || results[0].image,
            description: description || results[0].description,
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            updatedUser.password = hashedPassword;
        }

        await db.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId]);
        res.json({ message: "User updated successfully" });
    });
};
