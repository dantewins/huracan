export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    images?: string[];
    createdAt: Date;
}

export interface ImageItem {
    previewUrl: string;
    isUploading: boolean;
    error?: string;
}