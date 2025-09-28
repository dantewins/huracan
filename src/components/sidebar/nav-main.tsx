"use client";

import {
    IconPlus,
    IconDotsVertical,
    IconTrash,
} from "@tabler/icons-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
// import { useExpounds } from "@/contexts/expound-context";

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
    const searchParams = useSearchParams();
    // const { readmes } = useExpounds();
    const readmes = [
        {
            "owner": "dantewins",
            "repo": "swordle",
            "timestamp": "1753151925642",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`swordle`1753151925642.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`swordle`1753151925642.md"
        },
        {
            "owner": "dantewins",
            "repo": "expounder",
            "timestamp": "1753155464041",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`expounder`1753155464041.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`expounder`1753155464041.md"
        },
        {
            "owner": "dantewins",
            "repo": "capstone",
            "timestamp": "1753156136995",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`capstone`1753156136995.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`capstone`1753156136995.md"
        },
        {
            "owner": "dantewins",
            "repo": "swordle",
            "timestamp": "1753295102438",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`swordle`1753295102438.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`swordle`1753295102438.md"
        },
        {
            "owner": "dantewins",
            "repo": "swordle",
            "timestamp": "1753414619120",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`swordle`1753414619120.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`swordle`1753414619120.md"
        },
        {
            "owner": "dantewins",
            "repo": "swordle",
            "timestamp": "1753415402341",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`swordle`1753415402341.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`swordle`1753415402341.md"
        },
        {
            "owner": "dantewins",
            "repo": "swordle",
            "timestamp": "1753574092336",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`swordle`1753574092336.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`swordle`1753574092336.md"
        },
        {
            "owner": "dantewins",
            "repo": "bunni",
            "timestamp": "1754618945546",
            "path": "/expounder/readme`user_2zllyuuuwq327ood98no3vxv72u`dantewins`bunni`1754618945546.md",
            "name": "README`user_2zLLyUuuWq327OOd98no3vXv72U`dantewins`bunni`1754618945546.md"
        }
    ]

    const handleDelete = async (
        owner: string,
        repo: string,
        timestamp: string,
    ) => {
        try {
            const res = await fetch("/api/core/expound/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo, timestamp }),
            });
            if (!res.ok) throw new Error("Delete failed");
            // Assuming refresh is handled in context or refetch here if needed
            toast.success(`Successfully deleted ${owner}/${repo}`);
        } catch (e) {
            console.error("Error deleting expound:", e);
            toast.error(`Failed to delete ${owner}/${repo}`);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center mb-3">
                        <SidebarMenuButton
                            variant="outline"
                            tooltip="Add new"
                            className={clsx(
                                "flex w-full items-center justify-center gap-2 bg-stone-950 text-white hover:text-white hover:bg-neutral-900 transition-colors rounded-none",
                            )}
                            onClick={() => router.push("/dashboard/expounds")}
                        >
                            <IconPlus className="size-4" />
                            <span>Add</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarGroupLabel>Your chats</SidebarGroupLabel>

                    {readmes.map((item) => {
                        const uri = `/dashboard/expounds/file?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}&timestamp=${encodeURIComponent(item.timestamp)}`;

                        const isActive =
                            pathname === "/dashboard/expounds/file" &&
                            searchParams.get("owner") === item.owner &&
                            searchParams.get("repo") === item.repo &&
                            searchParams.get("timestamp") === item.timestamp;

                        return (
                            <SidebarMenuItem key={`${item.owner}-${item.repo}-${item.timestamp}`}>
                                <SidebarMenuButton
                                    className={`flex items-center justify-between ${isActive && "bg-muted text-primary"}`}
                                    onClick={() => router.push(uri)}
                                >
                                    <span>
                                        {item.owner}/{item.repo}
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
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(
                                                        item.owner,
                                                        item.repo,
                                                        item.timestamp,
                                                    );
                                                }}
                                            >
                                                <IconTrash className="mr-0.5 size-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}