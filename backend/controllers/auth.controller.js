import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res)=>{
    try {
        const {name, username, email, password} = req.body;
        if(!email || !password || !name || !username)
        {
            return res.status(400).json({message: "All fields are required"})
        }
        const exisitingEmail =await User.findOne({email});
        if(exisitingEmail){
            return res.status(400).json({message: "Email already in use"})
        }
        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message: "Username already in use"})
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User({
            name,
            email,
            password: hashedPassword,
            username
        })
        await user.save();

        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn: "3d"})
        
        res.cookie("jwt-linkedin",token,{
            httpOnly:true, //prevent xss attack
            maxAge: 3*24*60*60*1000, // 3 days
            sameSite:"strict", //csrf attacks
            secure: process.env.NODE_ENV === "production", //prevent men in the middle attack
        })
        res.status(201).json({message:"User registered sucessfully"});
        //postman

        //Welcome email
        const profileUrl = process.env.CLIENT_URL + "/profile/" +user.username

        try {
            await sendWelcomeEmail(user.email, user.name,profileUrl);  
        } catch (emailError) {
            console.log("Error sending Welcome Email", emailError);
        }


    } catch (error) {
        console.log("Error in signup", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res)=>{
    try {
        const {email, password} = req.body;
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User does not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"})}

        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn: "3d"});
        await res.cookie("jwt-linkedin",token,{
            httpOnly:true, //prevent xss attack
            maxAge: 3*24*60*60*1000, // 3 days
            sameSite:"strict", //csrf attacks
            secure: process.env.NODE_ENV === "production", //prevent men in the middle attack 
        })
        res.json({message:"Login successful"})

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
export const logout = async (req, res)=>{
    res.clearCookie("jwt-linkedin");
    res.send({message:"Logout successful"})
};

export const getCurrentUser = async (req, res)=>{
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getCurrentUser controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


