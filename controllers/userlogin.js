// DB CONNECTED
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const userLogIn = async (req, res) => {
  const { email, password } = req.body;

  //fields required
  if ( !email || !password  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
    //valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
    }

    //check if email exist
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

  try {
    // Check if the user with the provided email exists
    const user = await dbQuery("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
      return res.json({ message: "Incorrect password" });
    }

    // Generate a JWT token upon successful login
    const token = jwt.sign(
      { userId: user[0].id, username: user[0].username, email: user[0].email },
      process.env.USERTOKEN,
      { expiresIn: "1h" }
    );

    // Return the token in the Bearer Token format
    res.json({ message: "Login successful", token_type: "Bearer", access_token: token });
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
