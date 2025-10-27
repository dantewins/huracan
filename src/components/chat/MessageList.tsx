import React from 'react';
import { Message } from '@/types/message';

interface MessageListProps {
    messages: Message[];
    setSelectedImage: (url: string | null) => void;
}

export function MessageList({ messages, setSelectedImage }: MessageListProps) {
    return (
        <>
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`mb-6 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                >
                    <div
                        className={`max-w-[80%] ${msg.role === "user" ? "px-2 py-1 bg-gray-100 text-black" : "text-zinc-900"}`}
                    >
                        {msg.images && msg.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {msg.images.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`image ${idx + 1}`}
                                        className="h-40 w-auto object-cover rounded cursor-pointer"
                                        onClick={() => setSelectedImage(url)}
                                    />
                                ))}
                            </div>
                        )}
                        {msg.content}
                    </div>
                </div>
            ))}
        </>
    );
}