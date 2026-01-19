import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized ,no token provided Plaese try to Login again !' });
    }
    //bearer ke baad jo token aata hai wo nikalte hain
    const token=authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        if(!decoded){
            return res.status(401).json({message:'Unauthorized, Invalid token'});
        }
        //agar valid hai to req.user me decoded info rakh denge
        req.user=decoded;
        next();
    }catch(err){
        console.error("Error in auth middleware:", err);
        res.status(500).json({message:"Internal server error"});
    }
}