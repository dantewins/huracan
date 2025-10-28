import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AzureAnalysis, Solution } from '@/types/inspection';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiService = {
    async extractAddress(history: string): Promise<string | null> {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Extract the home address from this conversation history if mentioned. Return only the address string or "null" if not found or unclear.
            History: ${history}

            Address:`;

            const result = await model.generateContent(prompt);
            const text = (await result.response.text()).trim();

            return text === 'null' ? null : text;
        } catch (error) {
            console.error('Gemini API error:', error);
            return null;
        }
    },

    async generateSolutions(analysis: AzureAnalysis, context?: string): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = this.buildPrompt(analysis, context);

            const result = await model.generateContent(prompt);
            const text = (await result.response.text());

            return text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate solutions with Gemini AI');
        }
    },

    buildPrompt(analysis: AzureAnalysis, context?: string): string {
        let prompt = `You are a hurricane damage assessment expert. Analyze the following image analysis data and provide actionable solutions for homeowners. Image    Analysis Data:`;

        if (analysis.objects && analysis.objects.length > 0) {
            prompt += `\nDetected Objects:\n`;
            analysis.objects.forEach(obj => {
                prompt += `- ${obj.object} (confidence: ${Math.round(obj.confidence * 100)}%)\n`;
            });
        }

        if (analysis.tags && analysis.tags.length > 0) {
            prompt += `\nImage Tags:\n`;
            analysis.tags.forEach(tag => {
                prompt += `- ${tag.name} (confidence: ${Math.round(tag.confidence * 100)}%)\n`;
            });
        }

        if (analysis.captions && analysis.captions.length > 0) {
            prompt += `\nImage Descriptions:\n`;
            analysis.captions.forEach(caption => {
                prompt += `- ${caption.text} (confidence: ${Math.round(caption.confidence * 100)}%)\n`;
            });
        }

        if (context) {
            prompt += `\nAdditional Context: ${context}\n`;
        }

        prompt += `\nPlease provide a prioritized list of repair solutions. For EACH solution, use this EXACT format:
            SOLUTION: [Title]
            PRIORITY: [High/Medium/Low]
            DESCRIPTION: [Detailed description]
            COST: [Estimated cost range or specific amount]
            TIME: [Estimated time to complete]
            RESOURCES: [Required materials/tools]
            Provide 3-5 solutions based on the damage detected. Be specific with costs and timeframes.
        `;

        return prompt;
    },

    async generateFemaExplanation(disasters: any[], address: string): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `You are a FEMA assistance expert. Explain the following disaster declarations and available aid programs for the address: ${address}
                Disaster Declarations:
                ${disasters.map(d => `- ${d.title} (${d.state}) - ${d.declaration_date}`).join('\n')}

                Please provide:
                1. Explanation of what these disaster declarations mean
                2. Available FEMA assistance programs
                3. How to apply for assistance
                4. Important deadlines and requirements
                5. Additional resources and contacts

                Format your response in a helpful, easy-to-understand way for homeowners seeking assistance.
            `;

            const result = await model.generateContent(prompt);
            const text = (await result.response.text());

            return text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate FEMA explanation with Gemini AI');
        }
    },

    parseSolutions(text: string): Solution[] {
        const solutions: Solution[] = [];
        const solutionBlocks = text.split(/SOLUTION:/i).filter(block => block.trim());

        for (const block of solutionBlocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) continue;

            let title = lines[0].replace(/^[:\-]\s*/, '').trim();
            
            if (title.startsWith('**')) title = title.slice(2);
            if (title.endsWith('**')) title = title.slice(0, -2);
            title = title.trim();

            const solution: Partial<Solution> = {
                title,
                priority: 'medium',
                description: '',
                estimated_cost: undefined,
                estimated_time: undefined,
                resources_needed: []
            };

            for (const line of lines.slice(1)) {
                if (line.match(/^PRIORITY:/i)) {
                    const priority = line.replace(/^PRIORITY:/i, '').trim().toLowerCase();
                    if (priority.includes('high')) solution.priority = 'high';
                    else if (priority.includes('low')) solution.priority = 'low';
                    else solution.priority = 'medium';
                } else if (line.match(/^DESCRIPTION:/i)) {
                    solution.description = line.replace(/^DESCRIPTION:/i, '').trim();
                } else if (line.match(/^COST:/i)) {
                    solution.estimated_cost = line.replace(/^COST:/i, '').trim();
                } else if (line.match(/^TIME:/i)) {
                    solution.estimated_time = line.replace(/^TIME:/i, '').trim();
                } else if (line.match(/^RESOURCES:/i)) {
                    const resources = line.replace(/^RESOURCES:/i, '').trim();
                    solution.resources_needed = resources.split(',').map(r => r.trim()).filter(r => r);
                }
            }

            if (solution.title && solution.description) {
                solutions.push(solution as Solution);
            }
        }

        return solutions;
    }
};