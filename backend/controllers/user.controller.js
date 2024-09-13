import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"

export const getSuggestedConnections = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).select("-password");

        //not to connect to usrself and suggestions should be the ones who r not already connected
        const suggestedUser = await User.findById({
            _id:{
                $ne: req.user._id,
                $nin: currentUser.connections
            }
        }).select("name username profilePicture headline")
        .limit(3)

        res.json(suggestedUser)
    } catch (error) {
        console.log("Error in getSuggestedConnections controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getPublicProfile = async (req, res) =>{
    try {
        const user = await User.findOne({username:req.params.username}).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.json(user);

    } catch (error) {
        console.log("Error in getPublicProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            "name", 
            "username", 
            "headline", 
            "about",
            "location",
            "profilePicture",
            "bannerImg",
            "skills",
            "experience",
            "education"
        ];

        // Build the updatedData object dynamically
        const updatedData = {};

        
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updatedData[field] = req.body[field];
            }
        }

        if(req.body.profilePicture){
            const result = await cloudinary.uploader.upload(req.body.profilePicture)
            updatedData.profilePicture= result.secure_url
        }

        if(req.body.bannerImg){
            const result = await cloudinary.uploader.upload(req.body.bannerImg)
            updatedData.bannerImg= result.secure_url
        }

        //todo: check  for the profile image and banner image =>uploaded to cloudinary
        

        // Use findByIdAndUpdate to update the user profile
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updatedData },
            { new: true, select: "-password" } // Return the updated document, excluding the password
        );

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send the updated user profile
        res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

