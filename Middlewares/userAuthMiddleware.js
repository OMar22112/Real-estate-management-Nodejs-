import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const authenticateUser = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.USERTOKEN);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
