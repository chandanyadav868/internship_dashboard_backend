import { Api_Error } from "@/utils/CommanClass/ApiError";
import { Api_Response } from "@/utils/CommanClass/ApiResponse";
import type { Request, Response } from "express"

const healthCheckUp = async (req: Request, res: Response) => {
    try {
        res.json(new Api_Response({
            data: null,
            message: "Successfully Health route is working",
            status: 200
        }));

    } catch (error) {
        const err = error as Error
        res.json(new Api_Error({
            message: "Server Error Health route",
            error: err.message,
            stack: err.stack ?? "",
            status: 500
        }))
    }
}


export { healthCheckUp }