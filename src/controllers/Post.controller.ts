import PostSchema from "@/schema/Post.schema";
import { Api_Error } from "@/utils/CommanClass/ApiError";
import { Api_Response } from "@/utils/CommanClass/ApiResponse";
import type { Request, Response } from "express";
import z from "zod";

const postZodSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
})

const createPost = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const data = req.body;

        const postCreatingData: any = {};
        for (const [key, element] of Object.entries(data)) {
            postCreatingData[key] = element
        }

        postZodSchema.parse({ ...postCreatingData });

        const createdPost = await PostSchema.create({ userId, ...postCreatingData });

        return res.status(200).json(new Api_Response({
            data: createdPost,
            message: "Successfully created Post",
            status: 200
        }));

    } catch (error) {
        console.log("Error in creatingPost Controller:- ", error);

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

const deletePost = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const postId = req.params.postId

        const createdPost = await PostSchema.deleteOne({
            _id: postId,
            userId
        });

        return res.status(200).json(new Api_Response({
            data: null,
            message: "Successfully created Post",
            status: 200
        }));

    } catch (error) {
        console.log("Error in deletingPost Controller:- ", error);

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

export { createPost, deletePost }