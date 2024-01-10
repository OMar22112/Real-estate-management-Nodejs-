import async from "hbs/lib/async.js";
import db from "../db.js";

export const deleteUser = async (req, res)=>{
try{
    const userId = req.params.userId;

    const userExist = db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if(userExist.length === 0){
        return res.status(404).json({ message: "User not found" });
    }

    await db.query("DELETE FROM users WHERE id = ?",[userId]);
    res.json({ message: "User deleted successfully" });
}
 catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
}
}