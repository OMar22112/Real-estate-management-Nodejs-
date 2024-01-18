import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
})
pool.connect((err)=>{
  if(err)throw err
  console.log("Connect to PostgreSql")
})

export default pool;


// import mysql from "mysql";
// import dotenv from "dotenv";

// dotenv.config({ path: "./.env" });

// const db = mysql.createConnection({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE,
//   multipleStatements: true, // Enable multiple statements in one query
// });

// // Connect to MySQL
// function connectDatabase() {
//   db.connect((error) => {
//     if (error) {
//       console.error("MySQL connection error:", error.message);
//       setTimeout(connectDatabase, 2000); // Retry connection after 2 seconds
//     } else {
//       console.log("MySQL connected...");
//     }
//   });
// }

// // Initial connection
// connectDatabase();


// // Handle MySQL connection errors
// db.on("error", (error) => {
//   console.error("MySQL connection error:", error.message);
  
// });
