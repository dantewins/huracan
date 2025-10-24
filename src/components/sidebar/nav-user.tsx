"use client"


import { IconChevronDown, IconLogout } from "@tabler/icons-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, useSidebar, SidebarMenuItem } from "@/components/ui/sidebar"
import { useCallback, useState } from "react"
import { clsx } from "clsx"
import { useAuth } from "@/context/AuthContext"

export function NavUser() {
    const { user, logout } = useAuth()
    const { isMobile } = useSidebar();

    const handleSignOut = useCallback(() => {
        logout();
    }, []);

    const [open, setOpen] = useState(false);

    return user && (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(user?.id)}`} alt={user?.id} />
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.email}
                                </span>
                            </div>
                            <IconChevronDown
                                className={clsx(
                                    "ml-auto size-4 transition-transform duration-200",
                                    open && "rotate-180"
                                )}
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 !shadow-none"
                        side={isMobile ? "bottom" : "top"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-1 font-normal">
                            <div className="flex items-center gap-2 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(user?.id)}`} alt={user?.id} />
                                </Avatar>
                                <div className="grid flex-1 text-sm leading-tight">
                                    <span className="truncate font-medium">{user?.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="hover:cursor-pointer">
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}