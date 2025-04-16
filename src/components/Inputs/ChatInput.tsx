"use client";

import { useEffect, useRef } from "react";
import { SendIcon } from "..";

interface ChatInputProps {
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend?: () => void;
    errorMessage?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    name,
    value,
    placeholder,
    onChange,
    onSend,
    errorMessage
}) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-expands up to 150px, then scrolls
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 150)}px`;
        }
    };

    // Reset height when value is cleared
    useEffect(() => {
        if (value === "" && textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
        }
    }, [value]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="relative w-full flex items-center">
                <textarea
                    ref={textAreaRef}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    className="bg-black border-text border-[0.1rem] text-white rounded-2xl placeholder:text-text px-4 py-4 pr-12 w-full max-h-[150px] min-h-[40px] resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    rows={1}
                />
                {onSend && (
                    <button
                        type="button"
                        onClick={onSend}
                        className="absolute right-4 w-8 flex items-center justify-center text-indigo-500 rounded-tr-none cursor-pointer"
                    >
                        <SendIcon />
                    </button>
                )}
            </div>

            {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
        </div>
    );
};