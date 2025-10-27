export interface Inspection {
    id: string;
    user_id?: string;
    session_id: string;
    image_url: string;
    azure_analysis?: AzureAnalysis;
    damage_summary?: string;
    gemini_solutions?: string;
    created_at: string;
}

export interface AzureAnalysis {
    objects?: DetectedObject[];
    tags?: Tag[];
    captions?: Caption[];
    description?: Description;
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

export interface Description {
    tags: string[];
    captions: Caption[];
}

export interface DamageReport {
    severity: 'low' | 'medium' | 'high';
    issues: string[];
    confidence: number;
    summary: string;
}

export interface Solution {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_cost?: string;
    estimated_time?: string;
    resources_needed?: string[];
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

export interface FemaEligibility {
    eligible: boolean;
    disasters: FemaDisaster[];
    programs: string[];
    message: string;
}

export interface GeocodeResult {
    lat: number;
    lon: number;
    display_name: string;
    address: {
        house_number?: string;
        road?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

export interface SessionData {
    session_id: string;
    user_id?: string;
    created_at: string;
}