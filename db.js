import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config({ path:"./.env" });

const db = mysql.createConnection({
    host: process.env.DATABASE_host,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect( (error) =>{
    if(error){
        console.log(error)
    }else{
        console.log("MYSQL Connected...")
    }
});

export default db; 
