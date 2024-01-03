// DB CONNECTED
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import async from "hbs/lib/async.js";


export const register = (req, res) => {
  const { username, email, password, passwordConfirm } = req.body; // Fix typo here

  db.query("SELECT email FROM admins WHERE email = ?", [email], async (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    } else if (result.length > 0) {
      res.json({ message: "Email already exists" });
    } else if (password !== passwordConfirm) {
      res.json({ message: "Passwords do not match" });
    } else {
      let hashedPassword = await bcrypt.hash(password, 8);
      
      
    db.query("INSERT INTO admins SET ?", {username:username,email:email,password:hashedPassword}, (error,result)=>{
        if(error){
            console.log(error);
            res.status(500).json({ message: "Internal Server Error" });
        }else{
            
            res.json({ message: "Registration successful" });
        }
    });
    }
  });
};
