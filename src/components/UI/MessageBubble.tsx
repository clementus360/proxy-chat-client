"use client"

// components/MessageBubble.tsx
import clsx from "clsx"
import { format } from "date-fns"

type Props = {
    content: string
    created_at: string
    isSender: boolean
}

export function MessageBubble({ content, created_at, isSender }: Props) {
    return (
        <div className={clsx(
            "flex flex-col max-w-xs md:max-w-sm text-white gap-1",
            isSender ? "self-end items-end" : "self-start items-start"
        )}>
            <div className={clsx(
                "relative px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-md transition-all duration-200",
                isSender
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 rounded-tr-none"
                    : "bg-gradient-to-br from-gray-800 to-gray-700 rounded-tl-none"
            )}>
                {content}
            </div>
            <span className="text-[0.65rem] text-white/40">
                {format(new Date(created_at), "p")}
            </span>
        </div>
    )
}