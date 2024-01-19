import db from "../db.js";
import bcrypt from "bcryptjs";

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if the user exists
        db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            await db.query("DELETE FROM users WHERE id = ?", [userId]);
            res.json({ message: "User deleted successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
