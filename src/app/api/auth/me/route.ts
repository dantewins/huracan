import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession(req);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // remove id from session to prevent any authentication vulnerabilities
    const { id, ...secureSession } = session.user;

    return NextResponse.json(secureSession);
}