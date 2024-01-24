import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true, // Enable multiple statements in one query
});

// Connect to MySQL
function connectDatabase() {
  db.connect((error) => {
    if (error) {
      if (error.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("MySQL connection was closed. Reconnecting...");
        setTimeout(connectDatabase, 2000); // Retry connection after 2 seconds
      } else {
        console.error("MySQL connection error:", error.message);
        throw error; // You may want to handle this more gracefully in a production environment
      }
    } else {
      console.log("MySQL connected...");
    }
  });
}

// Initial connection
connectDatabase();

// Handle MySQL connection errors
db.on("error", (error) => {
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("MySQL connection was closed. Reconnecting...");
    connectDatabase();
  } else {
    console.error("MySQL connection error:", error.message);
  }
});

export default db;
