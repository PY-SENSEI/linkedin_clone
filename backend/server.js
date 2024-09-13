import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import connectionRoutes from "./routes/connection.route.js"

import { connectDb } from "./lib/db.js";



dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }
));

app.use(express.json({limit:"5mb"}));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/posts", postRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/connections", connectionRoutes)




app.listen(port,(req, res)=>{
    connectDb();
    console.log(`Server is running on the port: ${port}`)
    
})