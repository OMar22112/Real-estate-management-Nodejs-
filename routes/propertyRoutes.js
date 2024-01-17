// Import necessary modules
import express from 'express';
import { addProperties } from '../controllers/properties.js';
import { authenticateAdmin } from "../Middlewares/adminAuthMiddleware.js";
import multer from "multer";

// Create a router
const router = express.Router();
const upload = multer({
    limits: {
      fileSize: 10 * 1024 * 1024, // Adjust the limit as needed (e.g., 10 MB)
    },
  });
// Route to add a property, protected with authenticateAdmin middleware
router.post('/add', authenticateAdmin, upload.single("image"), addProperties);
// Export the router
export default router;
