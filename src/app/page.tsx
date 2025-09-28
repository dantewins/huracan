"use client"

import * as React from "react"
import { IconArrowUp, IconPlus } from "@tabler/icons-react"

export default function Home() {
  const [value, setValue] = React.useState("")
  const [count, setCount] = React.useState(0)
  const limit = 8000

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const MIN_HEIGHT = 36
  const MAX_HEIGHT = 240

  React.useEffect(() => {
    setCount(value.length)
  }, [value])

  React.useLayoutEffect(() => {
  const el = textAreaRef.current
  if (!el) return

  el.style.height = "auto"
  const scrollH = el.scrollHeight // includes padding
  const next = Math.max(MIN_HEIGHT, Math.min(scrollH, MAX_HEIGHT))
  el.style.height = `${next}px`
  el.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden"
}, [value])

  return (
    <div className="flex h-[85vh] items-center justify-center bg-white p-4">
      <div className="w-full max-w-2xl">
        <div>
          <h1 className="text-3xl text-center mb-10">Where should we begin?</h1>
        </div>
        <div className="relative group p-px bg-gradient-to-r from-sky-500/40 via-blue-500/40 to-fuchsia-500/40">
          <div className="absolute inset-0 blur-xl opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-fuchsia-500/20" />
          <div className="relative bg-white backdrop-blur-xl ring-1 ring-black/10 shadow-lg">
            <div className="relative">
              <textarea
                ref={textAreaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
                <button type="button" className="h-9 w-9 inline-flex items-center justify-center border border-black bg-black hover:cursor-pointer">
                  <IconArrowUp className="!h-5 !w-5 text-white" />
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}
