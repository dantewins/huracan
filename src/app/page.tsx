"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconArrowUp, IconPlus, IconSquareRoundedFilled } from "@tabler/icons-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function MainPage() {
    const [messages, setMessages] = React.useState<Message[]>([])
    const [value, setValue] = React.useState("")
    const [count, setCount] = React.useState(0)
    const [isSending, setIsSending] = React.useState(false)
    const limit = 8000

    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null)

    const MIN_HEIGHT = 36
    const MAX_HEIGHT = 240

    const isInitial = messages.length === 0

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
        if (!value.trim() || isSending) return

        const wasInitial = messages.length === 0

        setMessages((prev) => [...prev, { role: "user", content: value }])
        setValue("")

        if (wasInitial) {
            window.history.pushState({}, '', '/c/temp')
        }

        setIsSending(true)

        setTimeout(() => {
            setMessages((prev) => [...prev, { role: "assistant", content: `Echo: ${value}` }])
            setIsSending(false)
        }, 3000)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const InputGroup = (
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
                        disabled={isSending}
                        className="h-9 w-9 inline-flex items-center justify-center border border-black bg-black hover:cursor-pointer"
                    >
                        {isSending ? (
                            <IconSquareRoundedFilled className="!h-4 !w-4 text-white" />
                        ) : (
                            <IconArrowUp className="!h-5 !w-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div
            className={`flex flex-col h-[calc(100dvh-var(--header-height))] bg-white ${isInitial ? "items-center justify-center" : ""}`}
        >
            <div className={`${!isInitial ? "flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges] pt-8" : "w-full max-w-2xl"}`}>
                <div className={`w-full ${isInitial ? "max-w-2xl" : "max-w-3xl"} mx-auto`}>
                    <AnimatePresence>
                        {isInitial && (
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-3xl text-center mb-10"
                            >
                                Where should we begin?
                            </motion.h1>
                        )}
                    </AnimatePresence>

                    {!isInitial &&
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-6 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] ${msg.role === "user" ? "px-3 py-2 bg-gray-100 text-black" : "text-zinc-900"}`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                    {isSending && (
                        <div className="mb-6 flex justify-start">
                            <div className="text-zinc-900">Thinking...</div>
                        </div>
                    )}

                    {isInitial && (
                        <motion.div layoutId="input-group">
                            {InputGroup}
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {!isInitial && (
                <div className="mb-4 px-4 sm:px-0">
                    <div className="w-full max-w-3xl mx-auto">
                        <motion.div layoutId="input-group">
                            {InputGroup}
                        </motion.div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {!isInitial && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-zinc-500 mb-4"
                    >
                        This AI can make mistakes
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}