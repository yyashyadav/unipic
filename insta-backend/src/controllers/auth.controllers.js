import e from "express";
import pool from "../db.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

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
        const token =generateToken({id:user.id,username:user.username,email:user.email});

        res.json({
            token,
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
