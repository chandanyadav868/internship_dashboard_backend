import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserSchemaProps {
    _id?: string;
    username: string;
    email: string;
    password: string;
    avatar: string;
    refereshToken: string;
}

const userSchema = new Schema<UserSchemaProps>({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    refereshToken: {
        type: String

    }
}, { timestamps: true })

// this will run before saving the documets like creating or saving, it will hash the password
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


userSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
    // this method will extract passed object in deleteOne filtring params
    const filter = this.getFilter();
    const userId = filter._id;
    // await UserSchema.deleteOne({_id:userId});
    next();
})

export const UserSchema = mongoose.model<UserSchemaProps>("User", userSchema)