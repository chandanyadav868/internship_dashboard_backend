import express from "express"
import userRouter from "@/routes/User.route"
import healthRouter from "@/routes/HealthCheck.route"
import postRouter from "@/routes/Post.route"
import imageRouter from "@/routes/ImageKit.route"
import cookieparser from "cookie-parser"
import cors from "cors";
import dotenv from "dotenv"

// express methods tranfer all its methods on app, initialised
const app = express();

dotenv.config({
    path:".env"
})

// aap.use always run first before the handler function run 
// this will convert the given body data into json format, if not provided then give undefined body value
app.use(express.json());
// this is use for url data, if you are passing data with url
app.use(express.urlencoded({extended:true}))
// this is neccesary if you want to get cookie in object form otherwise req.cookies will be undefined
app.use(cookieparser());
// this will allow only this frontend 
app.use(cors({
    credentials:true,
    origin:"http://localhost:5173"
}))

app.use("/user",userRouter);
app.use("/health-checkup",healthRouter);
app.use("/post",postRouter)
app.use("/imagekit",imageRouter)


export { app }