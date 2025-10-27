import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'sessionId';
const SESSION_EXPIRY_DAYS = 7;

export async function getSession(req?: NextRequest) {
    const cookieStore = req ? req.cookies : cookies();
    const sessionId = (await cookieStore).get(SESSION_COOKIE)?.value;

    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!session || session.expires < new Date()) {
        if (session) await prisma.session.delete({ where: { id: sessionId } });
        return null;
    }

    return { userId: session.userId, user: session.user };
}

export async function createSession(userId: string, res?: NextResponse) {
    const expires = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const sessionId = uuidv4();

    await prisma.session.create({
        data: { id: sessionId, userId, expires },
    });

    const cookieStore = cookies();
    (await cookieStore).set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
        path: '/',
    });

    if (res) {
        res.cookies.set(SESSION_COOKIE, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
            path: '/',
        });
    }

    return sessionId;
}

export async function destroySession() {
    const cookieStore = cookies();
    const sessionId = (await cookieStore).get(SESSION_COOKIE)?.value;

    if (sessionId) {
        await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
        (await cookieStore).delete(SESSION_COOKIE);
    }
}

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}