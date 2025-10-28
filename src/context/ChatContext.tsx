"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface ChatContextType {
    chats: any[];
    refresh: () => void;
    loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<any[]>([]);
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        fetch("/api/chat")
            .then((r) => r.json())
            .then(({ chats = [] }) =>
                setChats(
                    chats.sort(
                        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                ),
            )
            .catch((e) => console.error("Failed to fetch chats:", e))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!authLoading && user) {
            refresh();
        } else if (!authLoading && !user) {
            setChats([]);
            setLoading(false);
        }
    }, [authLoading, user]);

    return (
        <ChatContext.Provider value={{ chats, refresh, loading }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChats() {
    const context = useContext(ChatContext);
    if (undefined === context) {
        throw new Error("useChats must be used within a ChatProvider");
    }
    return context;
}