import mongoose, { Schema } from "mongoose"

interface PostSchemaProps {
    _id?: string
    userId: Schema.Types.ObjectId;
    title: string;
    description: string
    image: string;
}

const postSchema = new Schema<PostSchemaProps>(
    {
        description: {
            type: String
        },
        title: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref:"User"
        },
        image: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Post", postSchema)