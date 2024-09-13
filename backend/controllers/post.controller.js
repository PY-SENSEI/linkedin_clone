import cloudinary from "../lib/cloudinary.js"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js"

export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.find({author:{$in: req.user.connections}})
        .populate("author", "name username profilePicture headline")
        .populate("comments.user", "name username profilePicture")
        .sort({createdAt: -1})

        res.json(posts)
    } catch (error) {
        console.log("Error in getFeedPosts controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const createPost = async (req, res) => {
    try {
        const {content, image} = req.body
        
        let newPost;

        if (image) {
              const imgResult =await cloudinary.uploader.upload(image)
              newPost= new Post({
                author:req.user._id,
                content,
                image:imgResult.secure_url
              })
        } else {
            newPost = new Post({
                author:req.user._id,
                content
            })
        }
        await newPost.save();

        res.status(201).json({message:"Post created successfully"})

    } catch (error) {
         console.log("Error in createPost controller", error.message)
        res.status(500).json({message: "Internal Server Error"})   
    }
}

export const deletePost = async (req, res) =>{
    try {
        const postId= req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if(!post){
            return res.status("404").json({message: "Post not found"})
        }
        if(post.author.toString() !== userId.toString()){
            return res.status("401").json
            ({message: "You are not authorized to delete this post"})
        }

        //deletes the post 
        if(post.image){
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0])
        }
        await Post.findByIdAndDelete(postId)

        res.status("200").json({message: "Post deleted successfully"})

    } catch (error) {
        console.log("Error in deletePost controller", error.message)
        res.status(500).json({message: "Server Error"})
    }
}

export const getPostById = async (req, res) =>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        .populate("author","name username profilePicture headline")
        .populate("comments.user","name username profilePicture headline")
        if(!post){
            return res.status("404").json({message: "Post not found"})
        }
        res.status(200).json("Post fetched successfully", post)

    } catch (error) {
        console.log("Error in getPostById controller", error.message)
        res.status(500).json({message: "Server Error"})
    }
}

export const createComment = async (req, res) =>{
    try {
        const postId = req.params.id;
        const { content } = req.body;

        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { comments: { user: req.user._id, content } }, 
            },
            {new : true})        
        .populate("author", "name username headline profilePicture");

        //create a notification if the comment owner is not the host owner
        if(post.author.toString() !== req.user._id.toString()){
            const newNotification = new Notification({
                recipient: post.author,
                type: "comment",
                relatedUser: req.user._id,
                relatedPost: postId
            })

            await newNotification.save(); 
            try {
                const postUrl = process.env.CLIENT_URL +"/post/" + postId;
                await sendCommentNotificationEmail(
                    post.author.email,
                    post.author.name, 
                    req.user.name, 
                    postUrl,
                    content
                );
            } catch (error) {
                console.log("Error in sending Comment Notification Email controller", error.message)
            }    
        }

        res.status(200).json({message: "Comment created successfully", post})
    } catch (error) {
        console.log("Error in createComment controller", error.message)
        res.status(500).json({message: "Server Error"})
        
    }
}

export const likePost = async (req, res) =>{
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const userId = req.user._id;

        if(post.likes.includes(userId)){
            post.likes= post.likes.filter(id => id !== userId.toString());
        }else{
            post.likes.push(userId)
            //create a notification if the post owner is not the user who liked
            if(post.author.toString() !== userId.toString()){
                const newNotification = new Notification({
                    recipient: post.author,
                    type: "like",
                    relatedUser: userId,
                    relatedPost: postId
                })
                await newNotification.save();
            }               
        }
        await post.save();
    } catch (error) {
        
    }
}