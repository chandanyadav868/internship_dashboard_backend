import { UserSchema, type UserSchemaProps } from "@/schema/User.Schema";
import { Api_Error } from "@/utils/CommanClass/ApiError";
import { Api_Response } from "@/utils/CommanClass/ApiResponse";
import type { CookieOptions, Request, Response } from "express";
import * as z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

const registerUser = z.object({
    email: z.email(),
    password: z.string().min(8)
});

const userIdCheck = z.object({
    userId: z.string()
})

dotenv.config({
    path: ".env"
})

const secretJWT = process.env.JWT_SECRET as string

const accessToken_refreshToken = async (payload: UserSchemaProps) => {

    const refreshToken = jwt.sign({ _id: payload._id, email: payload.email, username: payload.username }, secretJWT, {
        algorithm: "HS256",
        expiresIn: 1000 * 60 * 60 * 24 * 7
    })

    const accessToken = jwt.sign({ _id: payload._id }, secretJWT, {
        algorithm: "HS256",
        expiresIn: "1m"
    });

    await UserSchema.findOneAndUpdate(
        { _id: payload._id },
        {
            $set: {
                refreshToken: refreshToken
            },
        },
        {
            new: true
        }
    );

    return { refreshToken, accessToken }
}

const getUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        userIdCheck.parse({ userId });
        const monggooseId = new mongoose.Types.ObjectId(userId)
        const userExisting = await UserSchema.aggregate([
            {
                $match: {
                    _id: monggooseId
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "userId",
                    as: "posts"
                }
            },
            {
                $addFields: {
                    posts: {
                        $size: "$posts"
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                    __v: 0
                }
            }
        ])

        return res.status(200).json(new Api_Response({
            data: userExisting[0],
            message: "Successfully User Get",
            status: 200
        }))

    } catch (error) {
        console.log("Error in login Controller:- ", error);

        // this error for zod error
        if (error instanceof z.ZodError) {
            return res.json(new Api_Error({
                message: error.message,
                error: error,
                stack: error.stack ?? "",
                status: 500
            }))
        }

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        registerUser.parse({ email, password });

        const existingUser = await UserSchema.findOne({ email }).select("-refreshToken -__v").lean();
        if (!existingUser) {
            throw new Error("User does not exist")
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            throw new Error("Credentials not correct")
        }

        const { accessToken, refreshToken } = await accessToken_refreshToken(existingUser);

        const options: CookieOptions = {
            path: "/",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 60, // 1h
            expires: new Date(Date.now() + (1000 * 60 * 60 * 60))
        }

        res.cookie("accessToken", accessToken, options);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,     // ❗ Prevent JS access
            secure: false,       // ❗ Send only over HTTPS
            sameSite: "strict", // ❗ Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const data: Record<string, any> = {}

        for (const [key, value] of Object.entries(existingUser)) {
            const keyMatching = ["password", "refereshToken", "__v"];
            if (keyMatching.includes(key)) {
                continue
            }
            data[key] = value
        }

        res.json({
            ...new Api_Response({
                data: { ...data },
                message: "Successfully user logedin",
                status: 200
            })
        })


    } catch (error) {
        console.log("Error in login Controller:- ", error);

        // this error for zod error
        if (error instanceof z.ZodError) {
            return res.json(new Api_Error({
                message: error.message,
                error: error,
                stack: error.stack ?? "",
                status: 500
            }))
        }

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const registerController = async (req: Request, res: Response) => {
    try {
        // console.log(req);
        const { email, password } = await req.body;
        // console.log(email, password);

        // this will validate given input is valide or not if not then this function will throw error and that error will run the catch function
        registerUser.parse({ email, password });

        const existingUser = await UserSchema.findOne({ email })
        if (existingUser) {
            throw new Error("User already Exist")
        }

        const userResgister = await UserSchema.create({ email, password: password });

        // console.log(userResgister);

        res.status(200).json(new Api_Response({
            data: null,
            message: "Successfully User register",
            status: 201
        }))

    } catch (error) {
        console.log("Error in registering Controller:- ", error);

        // this error for zod error
        if (error instanceof z.ZodError) {
            return res.json(new Api_Error({
                message: error.message,
                error: error,
                stack: error.stack ?? "",
                status: 500
            }))
        }

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const logoutController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        // change refreshToken to empty string
        await UserSchema.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    refereshToken: ""
                }
            },
            {
                new: true
            }
        );

        // change accessToken value to empty because user have logout 
        res.cookie("accessToken", "", {})
        res.cookie("refreshToken", "", {})

        return res.json({
            ...new Api_Response({
                data: null,
                message: "Successfully logout",
                status: 200
            })
        })

    } catch (error) {
        console.log("Error in logout Controller:- ", error);

        // this error for zod error
        if (error instanceof z.ZodError) {
            return res.json({
                ...new Api_Error({
                    message: error.message,
                    error: error,
                    stack: error.stack ?? "",
                    status: 500
                })
            })
        }

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const userUpdateController = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const userId = req.userId;
        const updatingData: any = {};

        for (const [key, value] of Object.entries(data)) {
            updatingData[key] = value
        }

        const userExisting = await UserSchema.findOneAndUpdate(
            { _id: userId },
            {
                $set: updatingData
            },
            {
                new: true
            }
        ).select("-password -refreshToken -__v").lean();

        return res.status(200).json(new Api_Response({
            data: { ...userExisting },
            message: "Successfully updated",
            status: 200
        }))


    } catch (error) {
        console.log("Error in update Controller:- ", error);

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const userDeleteController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        const userDeleted = await UserSchema.deleteOne({ _id: userId });

        res.cookie("accessToken", "", {})

        return res.status(200).json(new Api_Response({
            message: "Successfully Deleted user",
            data: null,
            status: 200
        }));

    } catch (error) {
        console.log("Error in update Controller:- ", error);

        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

export { loginController, registerController, userDeleteController, userUpdateController, logoutController, getUser }