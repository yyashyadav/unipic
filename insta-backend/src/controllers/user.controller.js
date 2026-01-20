
import pool from "../db.js";

export async function getMe(req,res){
    const userId=req.user.id;
    try{
        const result=await pool.query(
            "SELECT id,username,email,created_at FROM USERS WHERE id=$1",[userId]
        );
        if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
        }
        res.json({ user: result.rows[0] });
    }catch(err){
        console.error("Error fetching my Profile data:", err);
        res.status(500).json({message:"Failed to fetch my profile data"});
    }
}