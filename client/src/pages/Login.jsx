import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { appContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate();

  const {backendUrl,getUserData} = useContext(appContent)

  const [state, setState] = useState('SignUp');
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsLoggedIn(true);

      axios.defaults.withCredentials = true;  // Corrected spelling error

      if (state === 'SignUp') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password });
        toast(data.message);
        if (data.success) {
          setIsLoggedIn(false);
          getUserData()
          navigate('/');
        } 
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });
        toast(data.message);
        setIsLoggedIn(false);
        getUserData()
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 cursor-pointer' />
      <div className='bg-slate-900 p-10 rounded-lg  shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'SignUp' ? 'Create Account' : 'Login'}</h2>
        <p className='text-center text-sm mb-6'>{state === 'SignUp' ? 'Create your account' : 'Login to your account'}</p>

        <form onSubmit={onSubmitHandler}>
          {state === 'SignUp' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]'>
              <img src={assets.person_icon} alt="" />
              <input onChange={e => setName(e.target.value)} value={name} className="bg-transparent outline-none" type="text" placeholder='Full Name' required />
            </div>
          )}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]'>
            <img src={assets.mail_icon} alt="" />
            <input onChange={e => setEmail(e.target.value)} value={email} className="bg-transparent outline-none" type="text" placeholder='Email Id' required />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]'>
            <img src={assets.lock_icon} alt="" />
            <input onChange={e => setPassword(e.target.value)} value={password} className="bg-transparent outline-none" type="password" placeholder='Password' required />  {/* Corrected type */}
          </div>

          <p onClick={() => navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>Forgot Password</p>

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>{state}</button>
        </form>

        {state === 'SignUp' ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{' '}
            <span 
              className="text-blue-400 cursor-pointer underline" 
              role="button" 
              tabIndex="0"
              onClick={() => setState('Login')} 
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{' '}
            <span 
              className="text-blue-400 cursor-pointer underline" 
              role="button" 
              tabIndex="0"
              onClick={() => setState('SignUp')} 
            >
              Sign Up here
            </span>
          </p>
        )}

      </div>
    </div>
  )
}

export default Login;