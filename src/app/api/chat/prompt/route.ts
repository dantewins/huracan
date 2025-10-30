import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { azureVisionService } from '@/lib/azure-vision';
import { geminiService } from '@/lib/gemini';
import { nominatimService } from '@/lib/nominatim';

export async function POST(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { inspectionId } = await req.json();
    const messages = await prisma.message.findMany({
        where: { inspectionId },
        orderBy: { createdAt: 'asc' },
    });
    if (messages.length === 0) return NextResponse.json({ error: 'No messages' }, { status: 400 });

    const latest = messages[messages.length - 1];
    if (latest.role !== 'user') return NextResponse.json({ error: 'Last message not user' }, { status: 400 });

    const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const address = await geminiService.extractAddress(history);
    let state = null;
    if (address) {
        const geo = await nominatimService.geocode(address);
        if (geo) {
            state = geo.state;
        }
    }

    let analyses: any[] = [];
    let damageSummaries: string[] = [];
    let solutionsTexts: string[] = [];

    if (latest.images.length > 0) {
        for (const imageUrl of latest.images) {
            const analysis = await azureVisionService.analyzeImage(imageUrl);
            analyses.push(analysis);

            const damageSummary = azureVisionService.generateDamageSummary(analysis);
            damageSummaries.push(damageSummary);

            const context = latest.content;
            const solutionsText = await geminiService.generateSolutions(analysis, context);
            solutionsTexts.push(solutionsText);
        }
    }

    const analysisContent = analyses.length > 0 ? analyses : null;
    const damageSummaryContent = damageSummaries.join('\n\n---\n\n') || null;
    const solutionsTextContent = solutionsTexts.join('\n\n---\n\n') || '';

    let femaExplanation = '';
    const filter = `incidentType eq 'Hurricane' and declarationDate gt '2025-01-01T00:00:00.000Z'${state ? ` and state eq '${state}'` : ''}`;
    const femaRes = await fetch(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=${encodeURIComponent(filter)}&$top=5&$orderby=declarationDate desc`);
    if (femaRes.ok) {
        const femaData = await femaRes.json();
        const disasters = femaData.DisasterDeclarationsSummaries || [];
        if (disasters.length > 0) {
            femaExplanation = await geminiService.generateFemaExplanation(disasters, address || 'your area');
        }
    }

    const prompt = `You are Hurcan, an AI assistant specialized in post-hurricane house inspections and recovery assistance.
        Your purpose is to:
        - Analyze house damage from uploaded images.
        - Provide detailed damage reports.
        - Suggest practical repair solutions.
        - Guide users on accessing aid from FEMA and other resources.
        - Be empathetic, helpful, and clear.
        Behavior guidelines:
        - Always start with a greeting in the first response: "Hello! I'm Hurcan, your AI assistant for post-hurricane recovery."
        - If the user's message is unrelated to house inspection or hurricane damage, politely explain your purpose and ask how you can help with their house.
        - If images are provided, use the analysis to provide a damage report and suggest solutions.
        - If relevant (e.g., damage detected or aid mentioned), include aid information from FEMA or nonprofits.
        - Use the provided analysis, summary, solutions, and FEMA info to craft a natural, flowing response.
        - Keep responses concise yet informative.
        - End with a question to continue the conversation, e.g., "Do you have more images or details?" or "What's your home address for more specific aid info?"
        Conversation history:
        ${history}
        Image analysis:
        ${analysisContent ? JSON.stringify(analysisContent, null, 2) : 'No images provided.'}
        Damage summary:
        ${damageSummaryContent || 'No damage analysis available.'}
        Solutions:
        ${solutionsTextContent || 'No solutions generated.'}
        FEMA and aid information:
        ${femaExplanation || 'No relevant disaster declarations found.'}
        Generate the response as Hurcan. Do not include any prompts or metadata in the output.
    `;

    const aiContent = await geminiService.generateSolutions({} as any, prompt);
    return NextResponse.json({ content: aiContent });
}