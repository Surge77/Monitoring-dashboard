import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}

export function errorMiddleware(err: ApiError, req: Request, res: Response, next: NextFunction): void {
    console.error(err.message);

    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
    }

    // Prisma unique constraint error
    if (err.code === 'P2002') {
        res.status(409).json({ error: 'A record with this value already exists' });
        return;
    }

    // Prisma not found error
    if (err.code === 'P2025') {
        res.status(404).json({ error: 'Record not found' });
        return;
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    res.status(statusCode).json({ error: message });
}

export class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}
