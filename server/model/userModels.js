const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    verifyOtp:{
        type:String,
        default:""
    },
    verifyOtpExpireAt:{
        type:Number,
        default:0
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    }, 
    resetOtp:{
        type:String,
        default:''
    },
    resetOtpExpireAt:{
        type:Number,
        default:''
    },
});

userSchema.methods.generateAuthToken = function() {
    const token =  jwt.sign({_id: this._id}, process.env.JWT_SECRET,{expiresIn: '24h'})
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password,10)
}

const userModel = mongoose.model('user',userSchema);

module.exports = userModel;