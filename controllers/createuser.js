import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const createUser = async (req, res) => {
    const { username, email, password, passwordConfirm, phone_no, description } = req.body;

    // fields required
    if (!username || !email || !password || !passwordConfirm || !phone_no || !req.file) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // check if email and phone_no exist
    db.query('SELECT * FROM users WHERE email = ? AND phone_no = ?', [email, phone_no],async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Internal Server Error' }) ,console.log(error);
            
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Email or Phone number already exists' });
            }
            if (password !== passwordConfirm) {
                return res.status(400).json({ message: "Passwords do not match" });
            }
            const hashedPassword = await bcrypt.hash(password, 8);

            // Assuming 'image' is the field name in your form data
            const image = req.file.buffer; // Buffer containing the image data

            // Generate a unique filename for the image
            const filename = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
            const imagePath = join(__dirname, '../uploads/', filename);

            // Save the image to the uploads folder
            fs.writeFileSync(`/tmp/uploads/${filename}`, fileBuffer);

        // Insert user data into the database
            await db.query("INSERT INTO users SET ?", {
                username: username,
                email: email,
                password: hashedPassword,
                phone_no: phone_no,
                image: filename, // Save the filename in the database
                description: description
            });

            // Generate the image URL
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

            res.status(201).json({ message: "Registration successful", imageUrl });

        });
    
};

// Add the upload middleware to handle file uploads
export const uploadImage = upload.single('image');







// DB CONNECTED
// import db from "../db.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import async from "hbs/lib/async.js";

// export const createUser = async (req,res)=>{
//     const { username, email, password,passwordConfirm, phone_no, image, description } = req.body;

//     //fields required
//     if (!username || !email || !password || !passwordConfirm || !phone_no || !image ) {
//         return res.status(400).json({ message: "All fields are required" });
//         }

//   //valid email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//     return res.status(400).json({ message: "Invalid email format" });
//     }

//   //check if email exist
//     if (password.length < 6) {
//         return res.status(400).json({ message: "Password must be at least 6 characters long" });
//     }

//     try{
//     const userExist = await db.query("SELECT email FROM users WHERE email = ?",[email]);

//     const PhoneNumberExist = await db.query("SELECT phone_no FROM users WHERE email = ?",[phone_no]);

//     if(userExist.length > 0){
//         return res.status(400).json({ message: "Email already exists" });
//     }

//     if(PhoneNumberExist.length > 0){
//         return res.status(400).json({ message: "Phone number already exists" });
//     }
//     if(password !== passwordConfirm){
//         return res.status(400).json({ message: "Passwords do not match" });
//     }
//     const hashedPassword = await bcrypt.hash(password,8);
//     await db.query("INSERT INTO users SET ?",{
//         username:username,
//         email:email,
//         password:hashedPassword,
//         phone_no:phone_no,
//         image:image,
//         description:description
//     })
//     res.status(201).json({ message: "Registration successful" });
    

//     }catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
    
// } 