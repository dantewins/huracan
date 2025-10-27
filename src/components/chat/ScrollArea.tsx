import React from 'react';
import { Message } from '@/types/message';

interface ScrollAreaProps {
    isInitial: boolean;
    messages: Message[];
    setIsAtBottom: (isAtBottom: boolean) => void;
    children: React.ReactNode;
}

export function ScrollArea({ isInitial, messages, setIsAtBottom, children }: ScrollAreaProps) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    React.useEffect(() => {
        const handleScroll = () => {
            const el = scrollRef.current;
            if (el) {
                const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1;
                setIsAtBottom(atBottom);
            }
        };

        const el = scrollRef.current;
        el?.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        return () => el?.removeEventListener("scroll", handleScroll);
    }, [messages, setIsAtBottom]); // Re-attach and check after messages change

    return (
        <div ref={scrollRef} className={`${!isInitial ? "flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges] pt-8" : "w-full max-w-2xl"}`}>
            <div className={`w-full ${isInitial ? "max-w-2xl" : "max-w-3xl pb-15"} mx-auto px-4 xl:px-0`}>
                {children}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}