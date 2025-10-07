import { Api_Error } from "@/utils/CommanClass/ApiError";
import type { Request, Response, NextFunction, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
    path: ".env"
})

const jwt_secret = process.env.JWT_SECRET as string

// this authentication function check user is logged in or not and user accessToken valid
const authentication = (req: Request, res: Response, next: NextFunction) => {
    try {
        // extract the accessToken from cookies, verify that cookies is valide if yes then convert it into the object as payload given at the time of intialised, if expire then run catch code
        const { accessToken, refreshToken } = req.cookies;

        if (!accessToken || accessToken.trim().length === 0 || !refreshToken) {
            return res.status(401).json(new Api_Error({ message: "Unauthorized", status: 401, error: "Not valid Request", stack: "" }))
        }

        let token = { _id: "" }

        try {
            token = jwt.verify(accessToken, jwt_secret) as { _id: string }
        } catch (error) {
            const err = error as Error
            // this condition for reissue the accessToken if user is did not logged out from app and token expired
            if (err.message === "jwt expired") {
                console.log("new Jwt is being fetched:- ", err.message);

                const refreshTokenId = jwt.verify(refreshToken, jwt_secret) as { _id: string };
                token = refreshTokenId

                const accessToken = jwt.sign({ _id: refreshTokenId._id }, jwt_secret, {
                    algorithm: "HS256",
                    expiresIn: "1m"
                });

                const options: CookieOptions = {
                    path: "/",
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 60, // 1h
                    expires: new Date(Date.now() + (1000 * 60 * 60 * 60))
                }

                res.cookie("accessToken", accessToken, options);
            } else {
                throw new Error(err.message)
            }
        }

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