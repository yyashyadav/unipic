
import pool from "../db.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateRefreshToken, generateToken,verifyToken } from "../utils/jwt.js";
import redis from "../redis.js";

export async function signUp(req, res) {
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        return res.status(400).json({error: "All fields are required"});
    }
    try {
        const hashedPassword = await hashPassword(password);
        
        const result =await pool.query(
            `INSERT INTO USERS (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email`,
            [username, email, hashedPassword]   
        );
        const user = result.rows[0];
        return res.status(201).json({user});
    }catch (err) {
        console.error("Error during sign up:", err);
        // if we need to exactly found weateher username validatin failed or email then we can do it by checking err.detail or err.constraint

        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: "Username or email already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}


export async function login(req, res) {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "Email and password are required"});
    }
    try{
        const result=await pool.query(
            "SELECT id,username,email,password_hash FROM USERS WHERE email=$1",[email]
        );
        const user = result.rows[0];
        if(!user){
            return res.status(400).json({error: "Invalid credentials"});
        }
        //here we comapre the password or verify it weather it matches or not
        const isValid= await comparePassword(password,user.password_hash);
        //if not verified
        if(!isValid){
            return res.status(400).json({error: "Invalid credentials"});
        }
        //now if verified we genrate the token from it 
        //here we giver username email. and id as payload
        const token =generateToken({id:user.id});
        const refreshToken=generateRefreshToken();

        // store session in redis with refresh token as key and user id as value
        await redis.set(`sess:${refreshToken}`, user.id, 'EX', 7 * 24 * 60 * 60); // 7 days expiry

        res.json({
            token,
            refreshToken,
            user:{
                email:user.email,
                id:user.id,
                username:user.username 
            }
        });

    }catch(err){
        console.error("Error during login:", err);
        res.status(500).json({error:"Internal server error"});
    }
}


export const logout = async (req, res) => {
  try {
    console.log("Logout request received");
    const token = req.headers.authorization?.split(" ")[1];
    const {refreshToken} = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const decoded = verifyToken(token);

    const expirySeconds = decoded.exp - Math.floor(Date.now() / 1000);

    if(expirySeconds > 0) {
         await redis.set(`bl:${token}`, "1", "EX", expirySeconds);
        console.log("Token blacklisted in Redis:", `bl:${token}`);
    }
    if (refreshToken) {
    await redis.del(`sess:${refreshToken}`);
    }
    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};

//this is the rrefresh the token controller


export const refresh =async(req,res)=>{
    const {refreshToken}=req.body;
    if(!refreshToken){
        return res.status(400).json({message:"Refresh token is required"});
    }
    //because useriD is the value of see:$refreshToken
    const userId=await redis.get(`sess:${refreshToken}`);

    if(!userId){
            return res.status(401).json({ message: "Invalid refresh token" });
    }
    //this sis called the rotation of refresh token
    await redis.del(`sess:${refreshToken}`);


    // now we genrate the new acess token and refresh token
    const newRefreshToken=generateRefreshToken();
    await redis.set(`sess:${newRefreshToken}`,userId,'EX',7*24*60*60);

    const newAccessToken=generateToken({id:userId});
    
    res.json({ 
        token:newAccessToken,
        refreshToken:newRefreshToken
    });

};