"use client";
import { setAuth, clearAuth } from "@/src/redux/slices/authSlice";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import api from "../lib/api.js";

function AuthBootstrap(){
    // This component can be used to initialize auth state from localStorage if needed
    const dispatch=useDispatch();

    useEffect(()=>{
      async function boot() {
        try {
          // const token = localStorage.getItem("token");
          const res=await api.get("/auth/me");
          dispatch(setAuth({
          user: res.data.user,
          token: localStorage.getItem("token"),
        }));
        } catch (err) {
          console.error("Auth boot error:", err);
          dispatch(clearAuth());
        }
      }
      boot();
    },[]);
    return null;

}

export default function Providers({ children }) {
  return <Provider store={store}>
    <AuthBootstrap /> 
    {children}
    </Provider>;
}