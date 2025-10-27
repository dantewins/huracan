import ImageAnalysisClient from '@azure-rest/ai-vision-image-analysis';
import { AzureKeyCredential } from '@azure/core-auth';
import type { AzureAnalysis } from '@/types/inspection';

const endpoint = process.env.AZURE_ENDPOINT!;
const key = process.env.AZURE_KEY_1!;

const client = ImageAnalysisClient(endpoint, new AzureKeyCredential(key));

export const azureVisionService = {
    async analyzeImage(imageUrl: string): Promise<AzureAnalysis> {
        try {
            const features = ['Caption', 'DenseCaptions', 'Objects', 'Tags', 'Read'] as const;

            const result = await client.path('/imageanalysis:analyze').post({
                body: { url: imageUrl },
                queryParameters: { features: [...features] },
                contentType: 'application/json'
            });

            if (result.status !== '200') {
                throw new Error(`Azure Vision API error: ${result.status}`);
            }

            const body = result.body as any;
            const analysis: AzureAnalysis = {};

            if (body.objectsResult?.values) {
                analysis.objects = body.objectsResult.values.map((obj: any) => ({
                    object: obj.tags?.[0]?.name || 'unknown',
                    confidence: obj.tags?.[0]?.confidence || 0,
                    rectangle: {
                        x: obj.boundingBox?.x || 0,
                        y: obj.boundingBox?.y || 0,
                        w: obj.boundingBox?.w || 0,
                        h: obj.boundingBox?.h || 0,
                    }
                }));
            }

            if (body.tagsResult?.values) {
                analysis.tags = body.tagsResult.values.map((tag: any) => ({
                    name: tag.name || 'unknown',
                    confidence: tag.confidence || 0
                }));
            }

            if (body.captionResult) {
                analysis.captions = [{
                    text: body.captionResult.text || '',
                    confidence: body.captionResult.confidence || 0
                }];
            }

            if (body.denseCaptionsResult?.values) {
                analysis.captions = [
                    ...(analysis.captions || []),
                    ...body.denseCaptionsResult.values.map((caption: any) => ({
                        text: caption.text || '',
                        confidence: caption.confidence || 0
                    }))
                ];
            }

            return analysis;
        } catch (error) {
            console.error('Azure Vision analysis error:', error);
            throw new Error('Failed to analyze image with Azure Computer Vision');
        }
    },

    generateDamageSummary(analysis: AzureAnalysis): string {
        const damageKeywords = [
            'damage', 'broken', 'crack', 'leak', 'flood', 'water', 'debris',
            'fallen', 'collapsed', 'destroyed', 'torn', 'missing', 'exposed'
        ];

        const structuralKeywords = [
            'roof', 'wall', 'window', 'door', 'foundation', 'beam', 'column',
            'pipe', 'electrical', 'wiring', 'insulation'
        ];

        let damageIndicators: string[] = [];
        let structuralElements: string[] = [];

        if (analysis.tags) {
            analysis.tags.forEach(tag => {
                if (damageKeywords.some(keyword =>
                    tag.name.toLowerCase().includes(keyword)
                )) {
                    damageIndicators.push(tag.name);
                }
                if (structuralKeywords.some(keyword =>
                    tag.name.toLowerCase().includes(keyword)
                )) {
                    structuralElements.push(tag.name);
                }
            });
        }

        if (analysis.captions) {
            analysis.captions.forEach(caption => {
                if (damageKeywords.some(keyword =>
                    caption.text.toLowerCase().includes(keyword)
                )) {
                    damageIndicators.push(caption.text);
                }
            });
        }

        let summary = 'Image analysis completed. ';

        if (damageIndicators.length > 0) {
            summary += `Potential damage indicators detected: ${damageIndicators.slice(0, 3).join(', ')}. `;
        }

        if (structuralElements.length > 0) {
            summary += `Structural elements identified: ${structuralElements.slice(0, 3).join(', ')}. `;
        }

        if (damageIndicators.length === 0 && structuralElements.length === 0) {
            summary += 'No obvious damage indicators detected in the image.';
        }

        return summary;
    }
};