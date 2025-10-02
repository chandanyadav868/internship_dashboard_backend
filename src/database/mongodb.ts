import { Api_Error } from "@/utils/CommanClass/ApiError";
import { connect } from "mongoose";

const mongodbUrl = process.env.MONGODB_URL
const databaseConnection = async () => {
    try {
        const connection = await connect(`${mongodbUrl}`, {
            dbName: 'intern_dashboard',
        });

        return connection

    } catch (error) {
        // this satisfy the typescript that error hold object of which type similar to the Error
        const err = error as Error

        // this will trow my own object use under the hood Error
        throw new Api_Error({
            message: err.message,
            error: err.cause,
            stack: err.stack ?? "",
            status: 500

        })
    }
}

export {databaseConnection}