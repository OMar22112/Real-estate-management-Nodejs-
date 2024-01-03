// DB CONNECTED
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path:"./.env" });

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
    // Check if the user with the provided email exists
    const user = await dbQuery("SELECT * FROM admins WHERE email = ?", [email]);

    if (user.length === 0) {
        return res.json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
        return res.json({ message: "Incorrect password" });
    }

    // Generate a JWT token upon successful login
    const token = jwt.sign({ userId: user[0].id, username: user[0].username, email: user[0].email }, process.env.TOKEN, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
    } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
    }
};

// Helper function to wrap db.query with a Promise
function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
