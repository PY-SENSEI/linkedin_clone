import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    profilePicture:{
        type: String,
        default: ""
    },
    bannerImage:{
        type: String,
        default: ""
    },
    headline:{
        type: String,
        default: ""
    },
    about:{
        type: String,
        default: ""
    },
    location:{
        type: String,
        default: ""
    },
    skills:{
        type: [String]
    },
    experience:[
        {
            title: String,
            company: String,
            startDate: Date,
            endDate: Date,
            description: String
        } 
    ],
    education:[
        {
            school: String,
            fieldOfStudy: String,
            startYear:Number,
            endYear: Number,
        }
    ],
    connections:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User
