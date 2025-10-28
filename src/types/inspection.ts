export interface AzureAnalysis {
    objects?: DetectedObject[];
    tags?: Tag[];
    captions?: Caption[];
}

export interface DetectedObject {
    object: string;
    confidence: number;
    rectangle: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

export interface Tag {
    name: string;
    confidence: number;
}

export interface Caption {
    text: string;
    confidence: number;
}

export interface Solution {
    title: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    estimated_cost?: string;
    estimated_time?: string;
    resources_needed: string[];
}

export interface FemaDisaster {
    id: string;
    title: string;
    state: string;
    county: string;
    declaration_date: string;
    incident_type: string;
    disaster_number: string;
    fy_declared: number;
}