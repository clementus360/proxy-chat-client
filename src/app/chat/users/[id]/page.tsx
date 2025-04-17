"use client"

import Image from 'next/image'
import { BackIcon, ChatInput, MessageBubble } from '@/components'
import { useEffect, useRef, useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/context/SocketContext'
import { addMessage, getMessages, markMessageAsRead } from '@/utils/db'
import { NewMessage } from '@/utils/types'


export default function Page() {
    const [messages, setMessages] = useState(() => [] as NewMessage[])
    const { registerMessageCallback } = useSocket()
    const [chatText, setChatText] = useState<string>('')
    const { currentChat } = useChat()
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const { socket } = useSocket()

    useEffect(() => {

        if (!currentChat) {
            console.error("No current chat available")
            return
        }

        const loadMessages = async () => {
            const loaded = await getMessages(Number(currentChat.id), 'user')
            console.log("Loaded messages:", loaded)
            setMessages(loaded)
        }

        loadMessages()

        const unregisterCallback = registerMessageCallback((message: NewMessage) => {
            const isForCurrentChat = message.sender_id === Number(currentChat.id) || message.receiver_id === Number(currentChat.id)
            if (isForCurrentChat) {
                setMessages((prevMessages) => [...prevMessages, message])
            }
        }
        )

        return () => {
            unregisterCallback()
        }
    }, [currentChat, registerMessageCallback])

    useEffect(() => {
        // set messages as read
        messages.forEach((message) => {
            if (!message.id) return
            markMessageAsRead(message.id)
            console.log("Message:", message.id, "marked as read")
        })
    }, [messages, registerMessageCallback])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    const onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setChatText(e.target.value)
    }

    const onSend = () => {
        if (!chatText.trim() || !currentChat) return

        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const newMessage: NewMessage = {
            sender_id: user.id,
            receiver_id: Number(currentChat.id),
            sender_name: user.username,
            type: 'text',
            content: chatText.trim(),
            created_at: new Date().toISOString(),
        }

        console.log("Sending message:", user, newMessage)
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(newMessage))
            addMessage(newMessage)
            setMessages(prev => [...prev, newMessage])
            setChatText('')
        } else {
            console.error("WebSocket not open")
        }
    }

    const onBack = () => {
        // Handle back navigation logic here
        router.back()
    }

    return (
        <div className="w-full h-full md:max-w-3/6 flex flex-col">
            {/* Header */}
            <div className="relative w-full border-b border-white/10 bg-black/30 backdrop-blur-md">
                <div className="flex w-full items-center justify-between py-4 px-4 md:px-12">
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <span className='w-6 h-6 flex items-center justify-center'>
                            <BackIcon />
                        </span>
                    </button>

                    {/* User Info */}
                    <div className="flex flex-col items-center">
                        <Image
                            src={currentChat?.image_url || "https://api.dicebear.com/9.x/bottts/png"}
                            width={64}
                            height={64}
                            alt={currentChat?.username || "Chat avatar"}
                            className="object-cover w-16 h-16 rounded-full border border-white/20 shadow-md"
                        />
                        <p className="text-white text-base font-semibold mt-1">
                            {currentChat?.username}
                        </p>
                    </div>

                    {/* Spacer for layout symmetry */}
                    <div className="w-10 h-10" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col px-4 md:px-12 py-8 gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
                {messages.map((msg, index) => {
                    const user = JSON.parse(localStorage.getItem('user') || '{}')
                    const isSender = msg.sender_id === user.id

                    return (
                        <MessageBubble
                            key={index}
                            content={msg.content}
                            created_at={msg.created_at}
                            isSender={isSender}
                        />
                    )
                })}
                <div ref={scrollRef} />
            </div>

            {/* Chat Input */}
            <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
                <div className="w-full md:max-w-3/6 flex gap-4">
                    <ChatInput
                        name={'chatText'}
                        placeholder={'Type your message...'}
                        value={chatText}
                        onChange={onChangeText}
                        onSend={onSend}
                    />
                </div>
            </div>
        </div>
    )
}
