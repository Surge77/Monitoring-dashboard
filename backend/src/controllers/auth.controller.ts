import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validation';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        const result = await authService.register(data);

        res.cookie('token', result.token, COOKIE_OPTIONS);
        res.status(201).json({ user: result.user, token: result.token });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);
        const result = await authService.login(data);

        res.cookie('token', result.token, COOKIE_OPTIONS);
        res.json({ user: result.user, token: result.token });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response) {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true });
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await authService.getMe(req.user!.userId);
        res.json({ user });
    } catch (err) {
        next(err);
    }
}
