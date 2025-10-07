import LikesDislikesSchema from "@/schema/LikesDislikes.schema";
import PostSchema from "@/schema/Post.schema";
import { Api_Error } from "@/utils/CommanClass/ApiError";
import { Api_Response } from "@/utils/CommanClass/ApiResponse";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import z from "zod";

const postZodSchema = z.object({
    description: z.string(),
    image: z.string().optional(),
})

const mongooseObjectId = (_id:string)=>{
    const objectId = new mongoose.Types.ObjectId(_id);
    return objectId
}

const createPost = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const data = req.body;

        const postCreatingData: any = {};
        for (const [key, element] of Object.entries(data)) {
            postCreatingData[key] = element
        }

        postZodSchema.parse({ ...postCreatingData });

        const createdNewPost = await PostSchema.create({ userId, ...postCreatingData });

        console.log("createPost:- ",createdNewPost);
        let findingPost = await PostSchema.findOne({_id:createdNewPost._id}).populate(["userId"],"-password -refreshToken -__v").lean();
        
        if (findingPost?.userId) {
            findingPost.createdBy = findingPost.userId
            findingPost.disLikeNumber = 0
            findingPost.likeNumber = 0
            findingPost.userDisliked = false
            findingPost.userLiked = false
            delete (findingPost as any)?.userId // bypass the typescript check
        }

        return res.status(200).json(new Api_Response({
            data: {...findingPost},
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

const updatePost = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const {postId} = req.params;
        const data = req.body;        

        const postCreatingData: any = {};
        for (const [key, element] of Object.entries(data)) {
            postCreatingData[key] = element
        }

        postZodSchema.parse({ ...postCreatingData });

        const updatingPost = await PostSchema.findOneAndUpdate(
            {
                _id: postId,
                userId
            },
            { ...postCreatingData },
            {
                new: true
            }
        );

        return res.status(200).json(new Api_Response({
            data: updatingPost,
            message: "Successfully updated Post",
            status: 200
        }));

    } catch (error) {
        console.log("Error in updatingPost Controller:- ", error);

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

const getPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = req
        console.log("userId:- ", userId);
        const objectId = new mongoose.Types.ObjectId(userId);

        // const posts = await PostSchema.find({ userId }).limit(5).sort({ createdAt: "asc" });
        // console.log("posts:- ", posts);

        const posts = await PostSchema.aggregate([
            {
                $match: { userId: objectId }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [
                        {
                            $project: {
                                password: 0,
                                refereshToken: 0,
                                __v: 0
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    createdBy: {
                        $arrayElemAt: ["$createdBy", 0]
                    }
                }
            },
            {
                $lookup: {
                    /**
                        * from: The target collection.
                        * localField: The local join field.
                        * foreignField: The target join field.
                        * as: The name for the results.
                        * pipeline: Optional pipeline to run on the foreign collection.
                        * let: Optional variables to use in the pipeline field stages.
                    */
                    from: "likedislikeschemas",
                    localField: "_id",
                    foreignField: "postId",
                    as: "result"
                }
            },
            {
                $addFields: {
                    /**
                        * newField: The new field name.
                        * expression: The new field expression.
                    */
                    likeNumber: {
                        $size: {
                            $filter: {
                                input: "$result",
                                as: "reaction",
                                cond: {
                                    $eq: ["$$reaction.like", true]
                                }
                            }
                        }
                    },
                    disLikeNumber: {
                        $size: {
                            $filter: {
                                input: "$result",
                                as: "reaction",
                                cond: {
                                    $eq: ["$$reaction.dislikes", true]
                                }
                            }
                        }
                    },
                    userLiked: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: "$result",
                                        as: "reaction",
                                        cond: {
                                            $and: [
                                                { $eq: ["$$reaction.like", true] },
                                                { $eq: ["$$reaction.userId", objectId] }
                                            ]
                                        }
                                    }
                                }
                            }
                            , 0]
                    },
                    userDisliked: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: "$result",
                                        as: "reaction",
                                        cond: {
                                            $and: [
                                                { $eq: ["$$reaction.dislikes", true] },
                                                { $eq: ["$$reaction.userId", objectId] }
                                            ]
                                        }
                                    }
                                }
                            }
                            , 0
                        ]
                    }
                }
            },
            {
                $project: {
                    /**
                        * specifications: The fields to
                        *   include or exclude.
                    */
                    result: 0
                }
            }
        ])

        return res.status(200).json(new Api_Response({
            data: posts,
            message: "Successfully created Post",
            status: 200
        }));
    } catch (error) {
        const err = error as Error
        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

const LikesDislikePost = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const { postId } = req.params;
        const likesandDislike = req.body
        console.log("likesandDislike:- ", likesandDislike);

        const likedOrDislikedDocs = await LikesDislikesSchema.findOneAndUpdate(
            { userId, postId },
            {
                $set: {
                    like: likesandDislike.like,
                    dislikes: likesandDislike.dislike
                }
            },
            {
                new: true,
                upsert: true
            }
        );
        console.log("posts:- ", likedOrDislikedDocs);

        return res.status(200).json(new Api_Response({
            data: likedOrDislikedDocs,
            message: "Successfully created Post",
            status: 200
        }));
    } catch (error) {
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
        const postId = req.params.postId;

        const createdPost = await PostSchema.deleteOne({
            _id: postId,
            userId
        });

        return res.status(200).json(new Api_Response({
            data: null,
            message: "Successfully Delete Post",
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

export { createPost, deletePost, getPosts, LikesDislikePost, updatePost }