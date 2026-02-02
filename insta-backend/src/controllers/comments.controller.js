import pool from "../db.js";

export async function addComment(req,res){
    const userId=req.user.id;
    const postId=req.params.id;
    const {content}=req.body;

    if(!content){
        return res.status(400).json({message:"Comment content is required"});
    }
    try{
        const result=await pool.query(
            `INSERT INTO comments (user_id,post_id,content) values($1,$2,$3) returning id,user_id,post_id,content,created_at`,
            [userId,postId,content]
        )
        res.status(201).json({
            message:"Comment added successfully",
            comment:result.rows[0]
        });
    }catch(err){
        console.error("Error in adding comment:",err);
        res.status(500).json({message:"Failed to add comment"});
    }
}
export async function getPostComments(req,res){
    const postId=req.params.id;
    try{
        const result=await pool.query(
            `SELECT 
            comments.id,
            comments.content,
            comments.created_at,
            users.id AS user_id,
            users.username
            FROM comments
            JOIN users ON users.id=comments.user_id
            Where comments.post_id=$1
            ORDER BY comments.created_at DESC`,
            [postId]   
        )
        res.status(200).json({
            message:"Comments fetched successfully",
            comments:result.rows
        });
    }catch(err){
        console.error("Error fetching comments:",err);
        res.status(500).json({message:"Failed to fetch comments"});
    }
}
export async function deleteComment(req, res) {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    try {
        const result = await pool.query(
            `DELETE FROM comments
             WHERE id = $1 AND user_id = $2`,
            [commentId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json({ message: "Comment deleted" });

    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ message: "Failed to delete comment" });
    }
}