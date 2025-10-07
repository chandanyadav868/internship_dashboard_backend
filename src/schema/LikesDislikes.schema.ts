import mongoose, { Schema } from "mongoose"

interface PostSchemaProps {
    _id?: string
    userId: Schema.Types.ObjectId;
    postId:Schema.Types.ObjectId;
    like: boolean
    dislikes: boolean;
}

const likeDislikeSchema = new Schema<PostSchemaProps>(
    {
        like: {
            type: Boolean,
            default: false
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref:"User"
        },
        postId: {
            type: mongoose.Types.ObjectId,
            ref:"Post"
        },
        dislikes: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model("LikeDislikeSchema", likeDislikeSchema)