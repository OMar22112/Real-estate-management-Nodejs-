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
import { userAddImage } from "../user_controllers/userAddImages.js";
import { userDeleteImage } from "../user_controllers/userDeleteImage.js";
import { userChangeStatus } from "../user_controllers/userChangeStatus.js";
import { userDeleteProperty } from "../user_controllers/userDeleteProperty.js";
import { propertiesByField } from "../controllers/propertybyfild.js";
import { userSearchForProperty } from "../user_controllers/userSearchForProperty.js";


import multer from "multer";

// Create a router
const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // Adjust the limit as needed (e.g., 10 MB)
  },
});
// Route to add a property, protected with authenticateAdmin middleware

//Admins route
router.post('/add', authenticateAdmin, upload.array("images", 5), addProperties);//Admin add property
router.post('/addimage/:propertyId', authenticateAdmin, upload.array("images", 5), addImageOfProperty);//Admin add image to a Specific property
router.get('/all',authenticateAdmin, getAllProperties);  //Admin show all properties
router.post('/editproperties/:propertyId',authenticateAdmin,upload.array("images", 5), editProperties);  //Admin update propert information
router.delete('/deleteimage/:propertyId/:imageId', authenticateAdmin, deleteImageOfProperty); //Admin delete image from specific property
router.delete('/deleteproperty/:propertyId', authenticateAdmin, deleteProperty); //Admin delete property 
router.post('/editstatus/:propertyId', authenticateAdmin, editPropertyStatus); //Admin change status of property
router.get('/search', authenticateAdmin, propertiesByField); //search for property


//Users route
router.post('/useradd', authenticateUser, upload.array("images", 5), userAddProperties);//User add property
router.get('/userProperty',authenticateUser, getAllPropertiesByUserId);//User show all properties
router.post('/editproperty/:propertyId',authenticateUser,userEditProperties);//User update his property
router.post('/userchangestatus/:propertyId',authenticateUser, userChangeStatus);//User change his property status
router.post('/useraddimage/:propertyId',authenticateUser,upload.array('images', 5),userAddImage);//user add image to his property
router.delete('/userdeleteimage/:propertyId/:imageId', authenticateUser, userDeleteImage); //user delete image from his property
router.delete('/userdeleteproperty/:propertyId', authenticateUser, userDeleteProperty); //user delete his property
//router.get('/usersearch', authenticateUser, userSearchForProperty); //User search for property




//guset route
router.get('/enduserall',getAllProperties); //end user
router.get('/gusetsearch', propertiesByField); //guset search for property
// Export the router
export default router;
