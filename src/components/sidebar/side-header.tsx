"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
    const pathname = usePathname()

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 text-black">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">{pathname.slice(11) ? pathname!.slice(11).replace(/^./, c => c.toUpperCase()) : 'Dashboard'}</h1>
                <div className="ml-auto flex items-center gap-3">
                    <Button variant="outline" asChild size="sm" className="hidden sm:flex">
                        <a href="#">Login</a>
                    </Button>
                    <Button variant="default" asChild size="sm" className="hidden sm:flex">
                        <a href="#">Sign up</a>
                    </Button>
                </div>
            </div>
        </header>
    )
}