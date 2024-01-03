// DB CONNECTED
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import async from "hbs/lib/async.js";

export const createUser = async (req,res)=>{
    const { username, email, password,passwordConfirm, phone_no, image, description } = req.body;

    try{
    const userExist = await db.query("SELECT email FROM users WHERE email = ?",[email]);

    if(userExist.length > 0){
        return res.status(400).json({ message: "Email already exists" });
    }
    if(password !== passwordConfirm){
        return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password,8);
    await db.query("INSERT INTO users SET ?",{
        username:username,
        email:email,
        password:hashedPassword,
        phone_no:phone_no,
        image:image,
        description:description
    })
    res.status(201).json({ message: "Registration successful" });
    

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    
} 