"use client"

import * as React from "react"
import { IconArrowUp, IconPlus } from "@tabler/icons-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function ChatPage() {
    const [messages, setMessages] = React.useState<Message[]>([
        // Placeholder messages to simulate a chat history
        { role: "assistant", content: "Hello! How can I help you today?" },
        { role: "user", content: "I'd like to know more about React hooks." },
        { role: "assistant", content: "Sure! React hooks are functions that let you use state and other React features in function components. The most common ones are useState and useEffect." },
    ])
    const [value, setValue] = React.useState("")
    const [count, setCount] = React.useState(0)
    const limit = 8000

    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null)

    const MIN_HEIGHT = 36
    const MAX_HEIGHT = 240

    React.useEffect(() => {
        setCount(value.length)
    }, [value])

    React.useLayoutEffect(() => {
        const el = textAreaRef.current
        if (!el) return

        el.style.height = "auto"
        const scrollH = el.scrollHeight
        const next = Math.max(MIN_HEIGHT, Math.min(scrollH, MAX_HEIGHT))
        el.style.height = `${next}px`
        el.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden"
    }, [value])

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!value.trim()) return

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: value }])
        setValue("")

        // Simulate assistant response (in a real app, this would call an API)
        setTimeout(() => {
            setMessages((prev) => [...prev, { role: "assistant", content: `Echo: ${value}` }])
        }, 500)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--header-height))] bg-white">
            <div className="flex-1 overflow-y-auto pb-8 pt-24">
                <div className="w-full max-w-4xl mx-auto">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-6 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] ${msg.role === "user"
                                        ? "p-4 rounded-full bg-gray-100 text-black"
                                        : "text-zinc-900"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="px-8 my-4 bg-white">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="relative group p-px bg-gradient-to-r from-sky-500/40 via-blue-500/40 to-fuchsia-500/40">
                        <div className="absolute inset-0 blur-xl opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-fuchsia-500/20" />
                        <div className="relative bg-white backdrop-blur-xl ring-1 ring-black/10 shadow-lg">
                            <div className="relative">
                                <textarea
                                    ref={textAreaRef}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything"
                                    className={[
                                        "w-full pt-4 pb-2 px-5 rounded-[1rem]",
                                        "resize-none bg-transparent border-0 outline-none shadow-none",
                                        "text-base text-zinc-900 placeholder-zinc-500 leading-6",
                                        "transition-[height] duration-150 ease-out will-change-[height]",
                                        "shadow-[inset_0_1px_0_0_rgba(0,0,0,0.04)]",
                                    ].join(" ")}
                                    style={{
                                        maxHeight: MAX_HEIGHT,
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between px-5 pb-4 pt-1">
                                <button type="button" className="h-9 w-9 hover:cursor-pointer">
                                    <IconPlus className="!h-5 !w-5 text-black" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    className="h-9 w-9 inline-flex items-center justify-center border border-black bg-black hover:cursor-pointer"
                                >
                                    <IconArrowUp className="!h-5 !w-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            <p className="text-center text-sm text-zinc-500 mb-4">
                This AI can make mistakes
            </p>
        </div>
    )
}