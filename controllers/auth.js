import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Fields required
  if (!username || !email || !password || !passwordConfirm) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Use pool.query for executing queries
    const existingUser = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert new user into the database using pool.query
    await pool.query('INSERT INTO admins (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
