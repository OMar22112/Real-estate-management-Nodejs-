import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import async from "hbs/lib/async.js";

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
    db.query('SELECT * FROM admins WHERE email = ?', [email],async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
            }
        
            if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            if (password !== passwordConfirm) {
                return res.status(400).json({ message: "Passwords do not match" });
            }
            
            const hashedPassword = await bcrypt.hash(password, 8);
        
            // Insert new user into the database
            db.query('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        
            res.status(201).json({ message: 'Registration successful' });
            });
        });
    };










