import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (token) {
            req.user = verifyToken(token);
        }
        next();
    } catch {
        next();
    }
}
