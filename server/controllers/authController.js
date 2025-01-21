const {validationResult} = require('express-validator');
const blackListTokenModel= require('../model/blacklistToken.model.js');
const userModel = require('../model/userModels.js');
const userService = require('../services/user.service.js');
const { model } = require('mongoose');


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