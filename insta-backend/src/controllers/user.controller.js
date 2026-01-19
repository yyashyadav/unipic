
import pool from "../db.js";

export async function getMe(req,res){
    const userId=req.user.id;
    try{
        const result=await pool.query(
            "SELECT id,username,email,created_at FROM USERS WHERE id=$1",[userId]
        );
        res.json({ user: result.rows[0] });
    }catch(err){
        console.error("Error fetching my Profile data:", err);
        res.status(500).json({message:"Failed to fetch my profile data"});
    }
}