interface ApiResponseProps {
    message: string;
    data: Record<string, any> | null,
    status: number
}
class Api_Response {
    message: string = '';
    data: Record<string, any> | null = null;
    status: number = 200
    constructor({ message, data, status }: ApiResponseProps) {
        this.message = message;
        this.data = data;
        this.status = status
    }
}

export { Api_Response }