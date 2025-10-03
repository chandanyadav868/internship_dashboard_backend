import express from "express"
import userRouter from "@/routes/User.route"
import healthRouter from "@/routes/HealthCheck.route"
import cookieparser from "cookie-parser"

// express methods tranfer all its methods on app, initialised
const app = express();

// aap.use always run first before the handler function run 
// this will convert the given body data into json format, if not provided then give undefined body value
app.use(express.json());
// this is use for url data, if you are passing data with url
app.use(express.urlencoded({extended:true}))
// this is neccesary if you want to get cookie in object form otherwise req.cookies will be undefined
app.use(cookieparser())

app.use("/user",userRouter);
app.use("/health-checkup",healthRouter)


export { app }