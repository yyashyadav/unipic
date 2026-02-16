"use client";

import api from "@/src/lib/api";
import { setAuth } from "@/src/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

export default function LoginPage(){
    const dispatch=useDispatch();
    const router=useRouter();


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);
        setError("");
        try{
            const res= await api.post("/auth/login",{email,password});
            const { user, token, refreshToken } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(setAuth({
                user: user,
                token: token,
            }));
            router.push("/feed");
        }catch(err){
            console.error(err);

        if (err.response?.data?.message) {
            setError(err.response.data.message);
        } else {
            setError("Login failed");
        }
        }finally{
            setLoading(false);
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md space-y-4 text-black"
            >
                <h1 className="text-2xl font-bold text-center">Login</h1>

                {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                />

                <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                />

                <button
                disabled={loading}
                className="w-full bg-black text-white p-3 rounded hover:bg-zinc-800 disabled:opacity-50"
                >
                {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
  );
}