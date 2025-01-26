const express = require('express');
const router = express.Router();

// Make sure these functions are defined in authController.js

const authMiddleware = require('../middleware/authMiddleware'); // Make sure this is correct
const userAuth = require('../middleware/userAuth'); // Make sure this is correct
const { registerUser, loginUser, getUserProfile, logOutUser, sendVerifyOtp, verifyEmail, resetPassword, isAuthenticat,sendResetOtp } = require('../controllers/authController');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile); // Protected route
router.post('/logout', logOutUser);
router.post('/send-verify-otp', sendVerifyOtp);
router.post('/verify-account', authMiddleware, verifyEmail); // Protected route
router.get('/is-auth', authMiddleware, isAuthenticat); // Protected route
router.post('/send-reset-otp',sendResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
