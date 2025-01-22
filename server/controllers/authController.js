const {validationResult, Result} = require('express-validator');
const blackListTokenModel= require('../model/blacklistToken.model.js');
const userModel = require('../model/userModels.js');
const userService = require('../services/user.service.js');
const { model } = require('mongoose');
const transporter = require('../config/nodeMailer.js');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { strict } = require('assert');
const bcrypt = require('bcrypt');


module.exports.registerUser = async (req,res,next) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    console.log(req.body) 

    const {name,email,password} = req.body;

    const isUserAlreadyExits = await userModel.findOne({email});

    if(isUserAlreadyExits){
        return res.status(400).json({message:"User already exits"});
    }
    
    const hashPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        name,
        email,
        password:hashPassword
    });

    const token = user.generateAuthToken()

    res.status(201).json({message:'Register Succesfull',token,user});
}

module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({message:'Login Succesfull', token, user });
} 

module.exports.getUserProfile = async (req,res,next) => {
    res.status(200).json({ message: "User Retrive",user:req.user});
}

module.exports.logOutUser = async (req,res,next) => {
    res.clearCookie('token');

    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blackListTokenModel.create({token});

    res.status(200).json({message:"Logout Succesfull"});
}

module.exports.sendVerifyOtp = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account within 24 hours.`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error('Email sending failed:', mailError);
            user.verifyOtp = '';
            user.verifyOtpExpireAt = null;
            await user.save();
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        res.json({ success: true, message: 'Verification OTP sent to your email' });
    } catch (error) {
        console.error('Error in sendVerifyOtp:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: 'Missing details: userId or OTP' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId format' });
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
        user.verifyOtp = hashedOtp;
        user.verifyOtpExpireAt = null;
        await user.save();

        res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports.isAuthenticat = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token is missing' });
        }

        const decoded = jwt.verify(token, secretKey);

        return res.json({ success: true, user: decoded });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

module.exports.sendRestOtp = async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });

        // If user not found
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash OTP before saving (for security)
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        console.log(hashedOtp);

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP expires in 24 hours
        await user.save();

        // Email setup
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account within 24 hours.`,
        };

        // Send OTP via email
        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error('Email sending failed:', mailError);
            // Reset OTP fields if email fails
            user.verifyOtp = '';
            user.verifyOtpExpireAt = null;
            await user.save();
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        // Send success response
        return res.status(200).json({ success: true, message: 'Verification OTP sent to your email' });
    } catch (error) {
        console.error('Error in sending OTP:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

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

        if (!user.verifyOtp || user.verifyOtp !== crypto.createHash('sha256').update(otp).digest('hex')) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;

        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
        
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'An error occurred, please try again' });
    }
};
