import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRouter from "./routes/auth.js"; // Assuming this is your authentication-related router
import propertyRouter from "./routes/propertyRoutes.js"; // Assuming this is your property-related router
import pool from "./db.js";

dotenv.config({ path: "./.env" });

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Get the current file's directory using import.meta.url
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static("uploads"));

// Define Routes
app.use("/", authRouter); // Mount the authentication-related routes under the root URL ("/")
app.use("/property", propertyRouter); // Mount the property-related routes under the '/property' URL

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
