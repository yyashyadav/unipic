import pool from "../db.js";

export async function createPost(req, res) {
    const userId= req.user.id;
    const {caption, media_url} = req.body;

    if(!media_url){
        return res.status(400).json({message:"Media URL is required"});
    }

    try{
        const result=await pool.query(
            `INSERT INTO POSTS (user_id,caption,media_url) VALUES ($1,$2,$3) RETURNING id, user_id, caption, media_url, created_at`,
            [userId, caption, media_url]
        );
        const post=result.rows[0];
        res.status(201).json({post});
    }catch(err){
        console.error("Error creating post:", err);
        res.status(500).json({message:"Failed to create post"});
    }
}