const { validationResult } = require('express-validator');
const blackListTokenModel = require('../model/blacklistToken.model.js');
const userModel = require('../model/userModels.js');
const userService = require('../services/user.service.js');
const transporter = require('../config/nodeMailer.js');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        const isUserAlreadyExists = await userModel.findOne({ email });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userService.createUser({
            name,
            email,
            password: hashPassword
        });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Registration successful', token, user });
    } catch (error) {
        next(error);
    }
};

// Login User
module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        next(error);
    }
};

// Get User Profile
module.exports.getUserProfile = async (req, res) => {
    res.status(200).json({ message: 'User retrieved', user: req.user });
};

// Logout User
module.exports.logOutUser = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        res.clearCookie('token');

        if (token) {
            await blackListTokenModel.create({ token });
        }

        res.status(200).json({ message: 'Logout Successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred during logout' });
    }
};

// Send Verification OTP
module.exports.sendVerifyOtp = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing userId' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: 'Account is already verified' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account within 24 hours.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Verification OTP sent to your email' });
    } catch (error) {
        next(error);
    }
};

// Verify Email
module.exports.verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: 'Missing details: userId or OTP' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        if (user.verifyOtp !== hashedOtp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;
        await user.save();

        res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send Reset OTP
module.exports.sendResetOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isAccountVerified === false) {
            return res.status(400).json({ success: false, message: 'Account is not verified' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Store the OTP and expiry time in the user object  
        user.verifyOtp = hashedOtp;
        user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;  // OTP expires in 15 minutes
        await user.save(); 

        // Send OTP via email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It will expire in 15 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Reset OTP sent to your email' });
    } catch (error) {
        next(error);
    }
};

// Reset Password
module.exports.resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        if (user.verifyOtp !== hashedOtp || user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;

        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check Authentication
module.exports.isAuthenticat = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true,message:"User Aunthenticate",user:decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};