import redis from "../redis.js";
import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req, res, next) {
    console.log("Auth middleware invoked");
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized ,no token provided Plaese try to Login again !' });
    }
    //bearer ke baad jo token aata hai wo nikalte hain
    const token=authHeader.split(' ')[1];

    try {
         // Step 1: check blacklist
        const isBlacklisted = await redis.get(`bl:${token}`);
        if (isBlacklisted) {

        console.log("Token is blacklisted:", `bl:${token}`);

        return res.status(401).json({ message: "Token expired, please login again" });
        }
        console.log("Token is not blacklisted, proceeding with verification.");
        // Step 2: verify JWT
        const decoded = verifyToken(token);

        req.user = decoded; // { userId, email }
        next();
    }catch(err){
        console.error("Error in auth middleware:", err);
        res.status(500).json({message:"Internal server error"});
    }
}