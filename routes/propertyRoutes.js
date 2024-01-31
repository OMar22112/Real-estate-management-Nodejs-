// Import necessary modules
import express from 'express';
import { addProperties } from '../controllers/properties.js';
import { getAllProperties } from '../controllers/allproperties.js';
import { addImageOfProperty } from '../controllers/addImageofproperty.js';
import { editProperties } from '../controllers/editProperties.js';
import { editPropertyStatus } from "../controllers/editpropertystatus.js"
import { deleteProperty } from "../controllers/deleteproperty.js"
import { deleteImageOfProperty } from '../controllers/deleteimageofproperty.js';
import { userAddProperties } from '../user_controllers/useraddProperty.js';
import { getAllPropertiesByUserId } from '../user_controllers/getAllPropertiesByUserId.js';
import { authenticateAdmin } from "../Middlewares/adminAuthMiddleware.js";
import { authenticateUser } from "../Middlewares/userAuthMiddleware.js"
import { userEditProperties } from '../user_controllers/userUpdateProperty.js';
import { userAddImage } from "../user_controllers/userAddImages.js"
import { userDeleteImage } from "../user_controllers/userDeleteImage.js"
import { userChangeStatus } from "../user_controllers/userChangeStatus.js"

import multer from "multer";

// Create a router
const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // Adjust the limit as needed (e.g., 10 MB)
  },
});
// Route to add a property, protected with authenticateAdmin middleware
router.post('/add', authenticateAdmin, upload.array("images", 5), addProperties);
router.post('/useradd', authenticateUser, upload.array("images", 5), userAddProperties);
router.post('/addimage/:propertyId', authenticateAdmin, upload.array("images", 5), addImageOfProperty);
router.get('/all',authenticateAdmin, getAllProperties);  // Export the router
router.get('/enduserall',getAllProperties);  // Export the router
router.post('/editproperties/:propertyId',authenticateAdmin,upload.array("images", 5), editProperties);  // Export the router
router.get('/userProperty',authenticateUser, getAllPropertiesByUserId);
router.delete('/deleteimage/:propertyId/:imageId', authenticateAdmin, deleteImageOfProperty); // New route for deleting an image
router.delete('/deleteproperty/:propertyId', authenticateAdmin, deleteProperty); // New route for deleting an image
router.post('/editstatus/:propertyId', authenticateAdmin, editPropertyStatus); // New route for deleting an image
  
router.post('/editproperty/:propertyId',authenticateUser,userEditProperties);
router.post('/userchangestatus/:propertyId',authenticateUser, userChangeStatus);
router.post('/useraddimage/:propertyId',authenticateUser,upload.array('images', 5),userAddImage);
router.delete('/userdeleteimage/:propertyId/:imageId', authenticateUser, userDeleteImage); // New route for deleting an image
// Export the router
export default router;
