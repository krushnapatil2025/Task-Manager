import React, { createContext, useState, useEffect } from "react";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

export const UserContext = createContext();
const UserProvider = ({children}) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true); // New state to track loading

    useEffect(() => {
        if (user) return;
        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
        setLoading(false);
        return;
    }

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE); 
            setUser(response.data);
        } catch (error){
            console.error("User not authenticated", error);
            clearuser();
        } finally{
            setLoading(false);
        }
    };
    fetchUser();
    },[]);

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("token", userData.token);
        setLoading(false);

    };

    const clearuser = ()=>{
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <UserContext.Provider value={{user,loading,updateUser,clearuser}}>
        {children}
        </UserContext.Provider>
    )

}
    
export default UserProvider