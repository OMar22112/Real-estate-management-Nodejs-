import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_host,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true, // Enable multiple statements in one query
});

// Connect to MySQL
function connectDatabase() {
  db.connect((error) => {
    if (error) {
      console.error("MySQL connection error:", error.message);
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        // Reconnect after a delay
        setTimeout(connectDatabase, 2000);
      } else {
        throw error;
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
  console.error("MySQL connection error:", error.message);
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    // Reconnect on connection loss
    connectDatabase();
  } else {
    throw error;
  }
});

export default db;
