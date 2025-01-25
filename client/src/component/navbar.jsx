import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { appContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();

  const {userData,backendUrl,setUserData,setLoggedIn} = useContext(appContent);

  const LogOut = async () => {
    try{
      axios.defaults.withCrendential = true

      const {data} = await axios.post(backendUrl+'/api/auth/logout');

      data.succes && setLoggedIn(false);
      data.succes && setUserData(false);
      navigate('/')
    }catch(error){
      toast.error(error.message)
    }
  }

  return (
    <div className="w-full flex justify-between p-4 sm:p-6 sm:px-24 position-absolute top-0">
      <img src={assets.logo} alt="Company Logo" className="w-28 sm:w-32" />

      {userData ? (
  <div className="relative group">
    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white">
      {userData.name?.[0]?.toUpperCase()}
    </div>

    {/* Dropdown Menu */}
    <div className="absolute hidden group-hover:block top-10 right-0 z-10 bg-white border border-gray-300 rounded shadow-lg">
      <ul className="list-none m-0 p-2">
        {!userData.isAccountVerified && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Verify Email</li>}
        <li
          onClick={LogOut}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          LogOut
        </li>
      </ul>
    </div>
  </div>
) : (
  <button
    onClick={() => navigate('/login')}
    className="flex items-center gap-2 border border-gray-500 rounded-full px-4 py-2 hover:bg-gray-100 transition-all"
  >
    Login
    <img src={assets.arrow_icon} alt="Arrow Icon" className="w-4 h-auto" />
  </button>
)}

     
    </div>
  );
};

export default Navbar;
