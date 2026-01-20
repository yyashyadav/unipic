import redis from "../redis.js";


//here we are using fixed window rate limiting approach  
//but if we want to use sliding window rate limiting approach we can use zset in redis but it high cost for memory
export function rateLimit({keyPrefix,limit,windowSeconds}){
 return async(req,res,next)=>{
    try{
        //logic for rate limiting
        const ip=req.ip||req.connection.remoteAddress;
        //this is the key like the how we store it in redis then we increment its value
        const key=`rl:${keyPrefix}:${ip}`;
        const current=await redis.incr(key);
        if(current==1){
            //set expiry only when the key is new
            await redis.expire(key,windowSeconds);
        }
        if(current>limit){
            return res.status(429).json({message:"Too many requests , please try again later"});
        }
        next();
    }catch(err){
        console.error("Error in rate limiting middleware:",err);
        //even if there is some error we should allow the request to go through 
        next();
    }
 }
}