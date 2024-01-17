// Import necessary modules
import express from 'express';
import { addProperties } from '../controllers/properties.js';
import { authenticateAdmin } from "../Middlewares/adminAuthMiddleware.js";

// Create a router
const router = express.Router();

// Route to add a property, protected with authenticateAdmin middleware
router.post('/add', authenticateAdmin, addProperties);

// Export the router
export default router;
