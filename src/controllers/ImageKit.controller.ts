import type { Request, Response } from "express";
import { Api_Error } from "@/utils/CommanClass/ApiError";
import { Api_Response } from "@/utils/CommanClass/ApiResponse";
import crypto from "crypto"


const ImageKitAuthentication = (req: Request, res: Response) => {
    try { 

        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
        
        const DEFAULT_TIME_DIFF = 60 * 30;
        const defaultExpire = Math.floor(Date.now() / 1000) + DEFAULT_TIME_DIFF;
        const uuid4 = crypto.randomUUID()
        
        const finalToken = uuid4;
        const finalExpire = defaultExpire;
        
        var signature = crypto.createHmac('sha1', privateKey??"").update(finalToken + finalExpire, 'utf8').digest('hex');
        
        console.log("token_expire_signature:- ", { finalToken, finalExpire, signature });

        res.status(200).send(new Api_Response({ status: 200, message: "Successfully", data: { token:finalToken, expire:finalExpire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY } }));

    } catch (error) {
        const err = error as Error
        console.log(err);

        return res.status(500).json(new Api_Error({
            message: err.message,
            error: err.cause ?? "Error",
            stack: err.stack ?? "",
            status: 500
        }))
    }
}

export { ImageKitAuthentication }