import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, "Please enter your name"],
        maxLength:[30, "Name should not exceed 30 characters"],
        minLength:[2, "Name should not less than 2 character"]
    },
    email: {
        type:String,
        required:[true, "Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password: {
        type:String,
        required:[true, "Please enter a password"],
        minLength:[8, "Password should not exceed 8 characters"],
        select:false
    },
    avatar: {
        public_id: {
            type:String,
            required:true
        },
        url: {
            type:String,
            required:true
        }
    },
    role: {
        type:String,
        default:"user"
    },
    createdAt: {
        type:Date,
        default:Date.now 
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
  
});

//JWT Token
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//Compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcryptjs.compare(enteredPassword, this.password);
}

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function(){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    //Hashing and adding resetPasswordToken in userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

export default mongoose.model("User", userSchema);