import express from "express";
import { register } from "../controllers/auth.js";
import { login } from "../controllers/login.js";
import { createUser } from "../controllers/createuser.js";
import { userLogIn } from "../controllers/userlogin.js";
const router = express.Router();


router.post("/register",register);
router.post("/login",login);
router.post("/createuser",createUser);
router.post("/userlogin",userLogIn);
//router.post("/login",login);

export default router; 

