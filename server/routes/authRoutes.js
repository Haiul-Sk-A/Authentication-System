const express = require('express');
const router = express.Router();

const {registerUser,loginUser,getUserProfile,logOutUser,sendVerifyOtp,verifyEmail,sendRestOtp,resetPassword, isAuthenticat} = require('../controllers/authController');
const authMiddlewar = require('../middlewar/authmiddlewar');
const userAuth = require('../middlewar/userAuth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddlewar, getUserProfile);
router.post('/logout', logOutUser);
router.post('/send-verify-otp',sendVerifyOtp);
router.post('/verify-account', authMiddlewar, verifyEmail);
router.get('/is-auth',userAuth,isAuthenticat)
router.post('/send-reset-otp',sendRestOtp);
router.post('/reset-password',resetPassword);



module.exports = router;