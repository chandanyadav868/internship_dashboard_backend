import mongoose, { Schema } from "mongoose"
import LikesDislikesSchema from "./LikesDislikes.schema";

interface PostSchemaProps {
    _id?: string
    userId: Schema.Types.ObjectId;
    description: string
    image: string;
    tags: string;
    disLikeNumber?: number
    likeNumber?: number
    userDisliked?: boolean
    userLiked?: boolean
    createdBy?: Record<string, any>;
}

const postSchema = new Schema<PostSchemaProps>(
    {
        description: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        tags: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

postSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
    const filter = this.getFilter();
    const postId = filter._id;
    await LikesDislikesSchema.deleteOne({ postId })
})

export default mongoose.model("Post", postSchema)