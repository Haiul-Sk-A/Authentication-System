import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import userModel from '../model/userModels';
export const register = async (req,res) => {

    const {name,email,password} = req.body

    if(!name || !email || !password){
        return res.json({succes:false,message:'Missing Details'})
    }

    try{

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({succes:false,message:'User Existing'})
        }

        const hashPassword = await bcrypt.hash(password,10)
        const user =new userModel({name,email,password:hashPassword});

        await user.save();

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        res.cookie('token',token {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production' ? 
            'none':'Strick',
            maxAge: 7  * 24 * 160 * 60 * 1000
        })

    }catch(error){
        res.json({succes:false,message:error.message})
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({})
    }
}