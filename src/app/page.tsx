"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconArrowUp, IconPlus, IconSquareFilled } from "@tabler/icons-react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

interface Message {
    role: "user" | "assistant"
    content: string
    images?: string[]
}

export default function MainPage() {
    const [messages, setMessages] = React.useState<Message[]>([])
    const [value, setValue] = React.useState("")
    const [count, setCount] = React.useState(0)
    const [isSending, setIsSending] = React.useState(false)
    const [images, setImages] = React.useState<File[]>([])
    const [isAtBottom, setIsAtBottom] = React.useState(true)
    const [showLeftFade, setShowLeftFade] = React.useState(false)
    const [showRightFade, setShowRightFade] = React.useState(false)
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const limit = 8000

    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)
    const scrollRef = React.useRef<HTMLDivElement | null>(null)
    const imagesContainerRef = React.useRef<HTMLDivElement | null>(null)

    const MIN_HEIGHT = 36
    const MAX_HEIGHT = 240
    const MAX_IMAGES = 10

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

    React.useEffect(() => {
        const handleScroll = () => {
            const el = scrollRef.current
            if (el) {
                const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1
                setIsAtBottom(atBottom)
            }
        }

        const el = scrollRef.current
        el?.addEventListener("scroll", handleScroll)

        // Initial check
        handleScroll()

        return () => el?.removeEventListener("scroll", handleScroll)
    }, [messages]) // Re-attach and check after messages change

    React.useEffect(() => {
        const updateFades = () => {
            const el = imagesContainerRef.current
            if (!el) return
            const { scrollLeft, scrollWidth, clientWidth } = el
            setShowLeftFade(scrollLeft > 0)
            setShowRightFade(scrollLeft + clientWidth < scrollWidth - 1) // -1 for floating point precision
        }

        const el = imagesContainerRef.current
        if (el) {
            el.addEventListener('scroll', updateFades)
            updateFades() // initial
        }

        return () => el?.removeEventListener('scroll', updateFades)
    }, [images])

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const selectedFiles = Array.from(e.target.files)
        const validImages = selectedFiles.filter(file => file.type.startsWith("image/") && file.type !== "image/gif")
        const invalidCount = selectedFiles.length - validImages.length
        const remaining = MAX_IMAGES - images.length
        const toAdd = validImages.slice(0, remaining)
        setImages((prev) => [...prev, ...toAdd])
        if (validImages.length > remaining) {
            toast.error(`Only ${remaining} image${remaining === 1 ? '' : 's'} added as the maximum limit is ${MAX_IMAGES}.`)
        }
        if (invalidCount > 0) {
            toast.error(`${invalidCount} invalid file${invalidCount === 1 ? '' : 's'} (GIFs or non-images) not added.`)
        }
        e.target.value = ""
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSend = () => {
        if (value.trim() === "" && images.length === 0 || isSending) return

        const wasInitial = messages.length === 0

        const imageUrls = images.map((file) => URL.createObjectURL(file))

        setMessages((prev) => [...prev, { role: "user", content: value, images: imageUrls }])
        setValue("")
        setImages([])

        if (wasInitial) {
            window.history.pushState({}, '', '/c/temp')
        }

        setIsSending(true)

        setTimeout(() => {
            setMessages((prev) => [...prev, { role: "assistant", content: `Echo: ${value} with ${imageUrls.length} images` }])
            setIsSending(false)
        }, 1000)
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
            <div className={`relative bg-white backdrop-blur-xl ring-1 ring-black/10 shadow-lg ${!isAtBottom ? 'shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]' : ''}`}>
                {images.length > 0 && (
                    <div className="relative px-5 pt-4 overflow-hidden">
                        <div
                            ref={imagesContainerRef}
                            className="flex flex-nowrap gap-2 overflow-x-auto ![&::-webkit-scrollbar]:hidden ![-ms-overflow-style:none] ![scrollbar-width:none]"
                        >
                            {images.map((file, idx) => (
                                <div key={idx} className="relative flex-shrink-0">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`upload ${idx + 1}`}
                                        className="h-16 w-16 object-cover rounded-lg cursor-pointer"
                                        onClick={() => setSelectedImage(URL.createObjectURL(file))}
                                    />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-0.5 right-0.5 bg-white p-0.5 rounded-full text-black hover:bg-gray-200 hover:cursor-pointer"
                                    >
                                        <XIcon className="!h-3 !w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={`absolute top-4 left-5 w-8 h-16 bg-gradient-to-r from-white to-transparent pointer-events-none transition-opacity duration-300 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute top-4 right-5 w-8 h-16 bg-gradient-to-l from-white to-transparent pointer-events-none transition-opacity duration-300 ${showRightFade ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                )}
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
                    <button
                        type="button"
                        aria-label="New"
                        className="relative -m-2 p-2 h-9 w-9 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer"
                        onClick={() => {
                            if (images.length < MAX_IMAGES) fileInputRef.current?.click()
                        }}
                    >
                        <IconPlus className="!h-5 !w-5 text-black" />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        className={`h-9 w-9 inline-flex items-center justify-center ${isSending ? 'bg-gray-200' : 'bg-black'} hover:cursor-pointer`}
                    >
                        {isSending ? (
                            <IconSquareFilled className="!h-4 !w-4 text-black" />
                        ) : (
                            <IconArrowUp className="!h-5 !w-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className={`flex flex-col h-[calc(100dvh-var(--header-height))] bg-white ${isInitial ? "items-center justify-center" : ""}`}>
            <div ref={scrollRef} className={`${!isInitial ? "flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges] pt-8" : "w-full max-w-2xl"}`}>
                <div className={`w-full ${isInitial ? "max-w-2xl" : "max-w-3xl pb-15"} mx-auto px-4 xl:px-0`}>
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
                <div className="mb-4 px-2">
                    <div className="w-full max-w-3xl mx-auto px-4 xl:px-0">
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

            {selectedImage && (
               <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <img
                        src={selectedImage}
                        alt="enlarged"
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="fixed top-4 right-4 text-white p-1 rounded-full hover:cursor-pointer"
                    >
                        <XIcon />
                    </button>
                </div>
            )}
        </div>
    )
}