import React from 'react';

interface ChatContainerProps {
    isInitial: boolean;
    children: React.ReactNode;
}

export function ChatContainer({ isInitial, children }: ChatContainerProps) {
    return (
        <div className={`flex flex-col h-[calc(100dvh-var(--header-height))] bg-white ${isInitial ? "items-center justify-center" : ""}`}>
            {children}
        </div>
    );
}