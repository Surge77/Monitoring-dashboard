import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, JwtPayload } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../utils/validation';
import { HttpError } from '../middlewares/error.middleware';

interface AuthResult {
    user: { id: string; email: string; createdAt: Date };
    token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new HttpError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
        data: { email: input.email, passwordHash },
        select: { id: true, email: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return { user, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
        throw new HttpError('Invalid email or password', 401);
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
        throw new HttpError('Invalid email or password', 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    return {
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
        token,
    };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
        throw new HttpError('User not found', 404);
    }
    return user;
}
