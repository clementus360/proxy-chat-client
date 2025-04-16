"use client";

import { Chat } from "@/utils/types";
import { createContext, useContext, useState, useEffect } from "react";

interface ChatContextType {
    currentChat: Chat | null;
    setChat: (chat: Chat | null) => void;
    updateChat: (chatData: Partial<Chat>) => void;
    removeChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const EXPIRATION_TIME = 1000 * 60 * 30; // 30 minutes in milliseconds

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentChat, setCurrentChat] = useState<Chat | null>(() => {
        if (typeof window === "undefined") return null;

        const storedChat = localStorage.getItem("currentChat");
        if (!storedChat) return null;

        try {
            const { chat, timestamp } = JSON.parse(storedChat);
            if (Date.now() - timestamp > EXPIRATION_TIME) {
                localStorage.removeItem("currentChat");
                return null;
            }
            return chat;
        } catch {
            localStorage.removeItem("currentChat");
            return null;
        }
    });

    useEffect(() => {
        if (currentChat) {
            localStorage.setItem("currentChat", JSON.stringify({ chat: currentChat, timestamp: Date.now() }));
        } else {
            localStorage.removeItem("currentChat");
        }
    }, [currentChat]);

    const setChat = (chat: Chat | null) => {
        setCurrentChat(chat);
    };

    const updateChat = (chatData: Partial<Chat>) => {
        setCurrentChat((prevChat) => {
            if (!prevChat) return null;
            return { ...prevChat, ...chatData };
        });
    };

    const removeChat = () => {
        setCurrentChat(null);
        localStorage.removeItem("currentChat");
    };

    return (
        <ChatContext.Provider value={{ currentChat, setChat, updateChat, removeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === null) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};