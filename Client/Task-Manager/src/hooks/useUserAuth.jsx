import { useContext, useEffect } from "react"
import { UserContext } from "../context/userContext"
import { useNavigate } from "react-router-dom";

export const useUserAuth = () => {
    const { user, loading, clearuser } = useContext(UserContext); // <-- FIXED here
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (user) return;

        if (!user) {
            clearuser(); // <-- FIXED here
            navigate("/login");
        }
    }, [user, loading, clearuser, navigate]);
}