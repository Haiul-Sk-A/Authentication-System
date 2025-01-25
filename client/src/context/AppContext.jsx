import { createContext, useEffect, useState } from "react";
import axios from "axios"; 
import { toast } from "react-toastify";

export const appContent = createContext();

export const AppContentProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [isLoggedIn, setLoggedIn] = useState(false); 
    const [userData, setUserData] = useState({}); 

    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth');

            if(data.message){
                setLoggedIn(true)
                getUserData()
            }
        }catch (error) {
            toast.error(error.message)
        }
    }       

    useEffect(() => {
        getAuthState();
    },[])

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`); 
            data.success? setUserData(data.userData) : toast.error(data.message)
            console.log(data)
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while fetching user data."); 
        }
    };

    const value = {
        backendUrl,
        isLoggedIn,
        setLoggedIn,
        userData,
        setUserData,
        getUserData,
    };

    return <appContent.Provider value={value}>{props.children}</appContent.Provider>;
};
