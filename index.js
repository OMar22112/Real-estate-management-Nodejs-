import express from "express";
import dotenv from "dotenv";
import path from "path";
import router from "./routes/auth.js";
import db from "./db.js";

dotenv.config({ path: "./.env" });

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Get the current file's directory using import.meta.url
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static( "uploads"));


// Define Routes
app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
