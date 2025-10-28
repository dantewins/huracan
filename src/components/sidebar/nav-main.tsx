"use client";

import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { useChats } from "@/context/ChatContext";
import { useState } from "react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function NavMain() {
    const router = useRouter();
    const pathname = usePathname();
    const { chats, refresh, loading: chatsLoading } = useChats();

    const [showAll, setShowAll] = useState(false);

    const displayedChats = showAll ? chats : chats.slice(0, 14);

    const handleDelete = async (id: string, title: string) => {
        try {
            const res = await fetch("/api/chat", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Delete failed");
            refresh();
            router.push('/')
            toast.success(`Successfully deleted chat ${title}`);
        } catch (e) {
            console.error("Error deleting chat:", e);
            toast.error(`Failed to delete chat ${title}`);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {!chatsLoading && (
                        <>
                            {chats.length !== 0 && <SidebarGroupLabel>Your chats</SidebarGroupLabel>}
                            {displayedChats.map((item) => {
                                const uri = `/c/${item.id}`;

                                const isActive = pathname === uri;

                                return (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            className={`flex items-center justify-between ${isActive && "bg-muted text-primary"}`}
                                            onClick={() => router.push(uri)}
                                        >
                                            <span className="truncate flex-1">
                                                {item.title}
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <span
                                                        className="inline-flex size-6 items-center justify-center hover:bg-gray-200 hover:cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <IconDotsVertical className="size-4" />
                                                    </span>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="!shadow-none">
                                                    <DropdownMenuItem
                                                        className="!text-red-600 hover:cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(
                                                                item.id,
                                                                item.title,
                                                            );
                                                        }}
                                                    >
                                                        <IconTrash className="mr-0.5 size-4" color="red" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                            {!showAll && chats.length > 14 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={() => setShowAll(true)}
                                        className="justify-center text-muted-foreground text-sm hover:text-foreground hover:underline py-1"
                                    >
                                        See all
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}