"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import { useAuth } from "@/context/AuthContext"

export function SiteHeader() {
    const pathname = usePathname()
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [isSignupOpen, setIsSignupOpen] = useState(false)
    const { user, loading } = useAuth()

    return (
        <>
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
                <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 text-black">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <h1 className="text-base font-medium">{pathname !== '/' ? pathname!.slice(3).replace(/^./, c => c.toUpperCase()) : 'Dashboard'}</h1>
                    <div className="ml-auto flex items-center gap-3">
                        {loading ? ('') : !user ? (
                            <>
                                <LoginForm
                                    open={isLoginOpen}
                                    onOpenChange={setIsLoginOpen}
                                />
                                <SignupForm
                                    open={isSignupOpen}
                                    onOpenChange={setIsSignupOpen}
                                />
                            </>
                        ) : null}
                    </div>
                </div>
            </header>

        </>
    )
}