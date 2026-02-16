import axios from "axios";

const api=axios.create({
    baseURL:"http://localhost:3001",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json",
    }
});

//attach the token to every request if exists
api.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

//now we handle the response errors globally especially 401 errors

/* 
   RESPONSE INTERCEPTOR
 */

   let isRefreshing = false;
   let failedQueue = [];

   const processQueue=(error,token=null)=>{
        failedQueue.forEach(prom=>{
            if(error){
                prom.reject(error);
            }else{
                prom.resolve(token);
            }
        });
        failedQueue=[];
   }

   api.interceptors.response.use((response)=>{
    return response;
   },
   async (error)=>{
    const originalRequest=error.config;
    if(error.response.status===401 && !originalRequest._retry){
        if(isRefreshing){
            return new Promise(function(resolve,reject){
                failedQueue.push({resolve,reject});
            }).then(token=>{
                originalRequest.headers['Authorization']='Bearer '+token;
                return api(originalRequest);
            });
        }
        isRefreshing=true;
        originalRequest._retry=true;
        try{
            const response=await api.post("/auth/refresh",{
                refreshToken: localStorage.getItem("refreshToken"),
            });
            const newToken = response.data.token;            
            const newRefreshToken = response.data.refreshToken; 

            localStorage.setItem("token", newToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            processQueue(null,newToken);
            originalRequest.headers.Authorization=`Bearer ${newToken}`;
            return api(originalRequest);
        }catch(err){
            processQueue(err,null);
            localStorage.removeItem("token");
            window.location.href = "/login";
            return Promise.reject(err);
        }finally{
            isRefreshing=false;
        }
    }
    return Promise.reject(error);
   }
)

export default api;