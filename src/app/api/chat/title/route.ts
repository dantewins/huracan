// New file: /api/chat/update-title.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { inspectionId } = await req.json();

    // Fetch the inspection to verify ownership
    const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
    });
    if (!inspection || inspection.userId !== session.userId) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Fetch the first two messages (user + assistant)
    const messages = await prisma.message.findMany({
        where: { inspectionId },
        orderBy: { createdAt: 'asc' },
        take: 2, // Only need the initial exchange for summary
    });

    if (messages.length < 2) {
        return NextResponse.json({ error: 'Insufficient messages for summary' }, { status: 400 });
    }

    // Format conversation for prompt
    const conversation = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');

    // Use Gemini to generate summary title
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Or whichever model you prefer

    const prompt = `Summarize this conversation in a short, concise title (max 50 characters):\n\n${conversation}`;

    try {
        const result = await model.generateContent(prompt);
        const summaryTitle = result.response.text().trim().slice(0, 50);

        // Update the inspection title
        await prisma.inspection.update({
            where: { id: inspectionId },
            data: { title: summaryTitle || 'New Chat' },
        });

        return NextResponse.json({ title: summaryTitle });
    } catch (error) {
        console.error('Error generating title:', error);
        return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
    }
}