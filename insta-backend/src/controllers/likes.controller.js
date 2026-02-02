import pool from "../db.js";

export async function likePost(req,res){
    const userId=req.user.id;
    const postId=req.params.id;
    try{
        await pool.query(
            `INSERT INTO likes (user_id,post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [userId,postId]
        );
        res.status(200).json({message:"Post liked successfully"});
    }catch(err){
        console.error("Error liking post:", err);
        res.status(500).json({message:"Failed to like post"});
    }
}

export async function unlikePost(req,res){
    const userId=req.user.id;
    const postId=req.params.id;
    try{
        await pool.query(`DELETE FROM likes WHERE user_id=$1 AND post_id=$2`,[userId,postId]);
        res.status(200).json({message:"Post unliked successfully"});
    }catch(err){
        console.error("Error unliking post:", err);
        res.status(500).json({message:"Failed to unlike post"});
    }
}

export async function getPostLikes(req,res){
    const postId=req.params.id;
    try{
        const result=await pool.query(
            `SELECT COUNT(*) FROM likes WHERE post_id=$1`,[postId]
        );
        const likeCount=parseInt(result.rows[0].count,10);
        res.status(200).json({likeCount});

    }catch(err){
        console.error("Error fetching post likes count:", err);
        res.status(500).json({message:"Failed to fetch post likes count"});
    }
}