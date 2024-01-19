import express from "express";
import { register } from "../controllers/auth.js";
import { login } from "../controllers/login.js";
import { createUser } from "../controllers/createuser.js";
import { userLogIn } from "../controllers/userlogin.js";
import { authenticateAdmin } from "../Middlewares/adminAuthMiddleware.js";
import { editUser } from "../controllers/edituser.js";
import { deleteUser } from "../controllers/deleteuser.js";
import { showAllUsers } from "../controllers/users.js";
import { newestUsers } from "../controllers/newestusers.js";
import { usersByField } from "../controllers/usersByField.js";
import multer from "multer";


const router = express.Router();
const upload = multer({
    limits: {
      fileSize: 10 * 1024 * 1024, // Adjust the limit as needed (e.g., 10 MB)
    },
});


router.post("/register",register);
router.post("/login",login);
router.post("/createuser", authenticateAdmin, upload.single('image') ,createUser);
router.post("/edituser/:userId", authenticateAdmin, editUser);
router.delete("/deleteuser/:userId", authenticateAdmin, deleteUser);
router.get("/allusers", authenticateAdmin, showAllUsers);
router.get("/newestusers", authenticateAdmin, newestUsers);
router.get("/users", authenticateAdmin, usersByField);
router.post("/userlogin",userLogIn);
//router.post("/login",login);

export default router; 

