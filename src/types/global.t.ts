import 'express'

// this is extending the previous declare typescript
declare global {
    namespace Express {
        interface Request {
            userId:string
        }
    }
}