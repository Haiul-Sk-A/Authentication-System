const express = require('express');
const router = express.Router();

const {registerUser,loginUser,getUserProfile,logOutUser,sendVerifyOtp,verifyEmail,sendRestOtp,resetPassword} = require('../controllers/authController');
const authMiddlewar = require('../middlewar/authmiddlewar');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddlewar, getUserProfile);
router.post('/logout', logOutUser);
router.post('/send-verify-otp',sendVerifyOtp);
router.post('/verify-account', authMiddlewar, verifyEmail);
router.post('/send-reset-otp',sendRestOtp);
router.post('/reset-password',resetPassword);



module.exports = router;