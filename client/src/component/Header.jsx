import React, { useContext } from 'react'; 
import { assets } from '../assets/assets';
import { appContent } from '../context/AppContext';

const Header = () => {

    const {userData} = useContext(appContent)

    return (
        <div className="flex flex-col items-center text-center py-6">
            <img 
                src={assets.header_img} 
                alt="Developer Profile" 
                className="w-36 h-36 rounded-full mb-4" 
            />
            <h1 className="text-2xl font-bold flex items-center">
                Hey {userData? userData.name : 'Developer'}
                <img 
                    className="w-5 h-5 ml-2 aspect-square" 
                    src={assets.hand_wave} 
                    alt="Waving Hand" 
                />!
            </h1>

            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our app</h2>
            <p className='mb-8 max-w-md'>Let's start with a quick product tour. We'll have you up and running in no time!</p>

            <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all">Get Started</button>
        </div>
    );
};

export default Header;
