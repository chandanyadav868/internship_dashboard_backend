import { Api_Error } from "@/utils/CommanClass/ApiError";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
    path: ".env"
})

const jwt_secret = process.env.JWT_SECRET as string

const authentication = (req: Request, res: Response, next: NextFunction) => {
    try {
        // extract the accessToken from cookies, verify that cookies is valide if yes then convert it into the object as payload given at the time of intialised, if expire then run catch code
        const { accessToken } = req.cookies;

        console.log(req.body);


        if (accessToken.trim().length === 0) {
            return res.status(401).json(new Api_Error({ message: "Unauthorized", status: 401, error: "Not valid Request", stack: "" }))
        }



        const token = jwt.verify(accessToken, jwt_secret) as { _id: string }

        console.log(token);
        // body object add userId property of value, token?._id
        (req as any).userId = token?._id
        next();

    } catch (error) {
        console.log("Error in authentication Controller:- ", error);

        const err = error as Error
        return res.status(500).json({
            ...new Api_Error({
                message: err.message,
                error: err.cause ?? "Error",
                stack: err.stack ?? "",
                status: 500
            })
        })
    }
}

export { authentication }