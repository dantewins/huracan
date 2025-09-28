"use client"

import {
    IconChevronDown,
    IconLogout,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    useSidebar,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCallback, useState } from "react"
import { clsx } from "clsx"
import { cn } from "@/lib/utils" // Assuming you have a cn utility from shadcn/ui or similar; if not, import and define it as needed.

function UserProfile({
    className,
    imageSrc = 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yekxMeVJGbkN4blY5VTE1UWxsSWNxczdTbmoifQ',
    alt = 'Danny',
    fallback = 'DK', // Updated to 'DK' for Danny Kim; adjust if needed.
    name = 'Danny Kim',
    email = 'kimdanny0603@gmail.com',
}: {
    className?: string;
    imageSrc?: string;
    alt?: string;
    fallback?: string;
    name?: string;
    email?: string;
}) {
    return (
        <div className={cn("flex items-center gap-2 text-left text-sm", className)}>
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={imageSrc} alt={alt} />
                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="text-muted-foreground truncate text-xs">{email}</span>
            </div>
        </div>
    )
}

export function NavUser() {
    // const { user, isLoaded } = useUser();
    const { isMobile } = useSidebar();

    const handleSignOut = useCallback(() => {

    }, []);

    const [open, setOpen] = useState(false);

    // if (!isLoaded) {
    //     return null;
    // }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {/* <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.emailAddresses[0].emailAddress}
                                </span>
                            </div> */}
                            {/* Replaced with UserProfile; uncomment the above and pass props from user if using dynamic data */}
                            <UserProfile />
                            <IconChevronDown
                                className={clsx(
                                    "ml-auto size-4 transition-transform duration-200",
                                    open && "rotate-180"
                                )}
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "top"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <UserProfile className="px-1 py-1.5" />
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}