import express from "express";
import dotenv from "dotenv";
import path from "path";
import router from "./routes/auth.js";
//DB CONNECTED
import db from "./db.js"

dotenv.config({ path:"./.env" });

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// app.get("/",(req,res) =>{
//     res.send("<h1>Hello world</h1>")
// });

//define Routes
app.use("/",router)

app.listen(port, ()=>{
    console.log(`Srever running on port ${port}`);
})