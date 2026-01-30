import pool from "../db.js";


export async function getFeed(req,res){
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const userId=req.user.id;
    try{
        const result=await pool.query(
            `SELECT
            posts.id,
            posts.media_url,
            posts.caption,
            posts.created_at,
            users.id AS user_id,
            users.username
            FROM posts
            JOIN users ON users.id = posts.user_id
            WHERE posts.user_id = $1
            OR posts.user_id IN (
                SELECT following_id
                FROM follows
                WHERE follower_id = $1
            )
            ORDER BY posts.created_at DESC
            LIMIT $2
            OFFSET $3`,
            [userId, limit, offset]   
        );
        res.status(200).json(result.rows);
    }catch(err){
        console.error("Error fetching feed:", err);
        res.status(500).json({message:"Failed to fetch feed"});
    }
}