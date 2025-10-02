
interface ApiErrorProps {
    message: string
    stack: string
    status: number
    error: string | unknown
}

class Api_Error extends Error {
    message: string = '';
    stack: string = ''
    status: number = 500
    error: string | unknown = ''
    constructor({ message, error, stack, status }: ApiErrorProps) {
        super(message)
        this.message = message;
        this.error = error;
        this.stack = stack??"";
        this.status = status
    }
}

export {Api_Error}