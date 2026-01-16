export class AppError extends Error {
    statusCode: number;
    message: string;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode || 500;
        this.message = message;
    }
}
export function errorHandler(err: any, req: any, res: any, next: any, NODE_ENV: string) {
    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : 'Internal server error';

    res.status(status).json({
        error: {
            message,
            ...(NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
}
