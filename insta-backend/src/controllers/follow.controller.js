import pool from "../db.js";

export async function followUser(req, res) {
    const followerId = req.user.id;
    const followingId = req.params.id;
    if(followerId === followingId){
        return res.status(400).json({message:"You cannot follow yourself"});
    }
    try{
        //check if the user to be followed exists we are using no conflict here
       await pool.query(
            `INSERT INTO follows (follower_id,following_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [followerId, followingId]
        );
        res.status(200).json({message:"Followed successfully"});
    }catch(err){
        console.error("Error following user:", err);
        res.status(500).json({message:"Failed to follow user"});
    }
}
export async function unfollowUser(req,res){
    const followerId=req.user.id;
    const followingId=req.params.id;
    try {
        await pool.query(
            `DELETE FROM follows WHERE follower_id=$1 AND following_id=$2`,[followerId,followingId]
        );
        res.status(200).json({message:"Unfollowed successfully"});
    } catch (err) {
        console.error("Error unfollowing:", err);
        res.status(500).json({message:"Failed to unfollow"});
    }
}