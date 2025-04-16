"use client"

import React from 'react'
import { Button, GroupIcon, PlusIcon, UserIcon } from '..'
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Link from 'next/link';

// interface NavItem {
//     title: string;
//     link: string;
// }

// const navItems: NavItem[] = [
//     { title: "Users", link: "/chat/users" },
//     { title: "Groups", link: "/chat/groups" },
// ];

export function Menu() {
    const pathname = usePathname();

    const isActive = (link: string) => {
        return pathname === link;
    };

    return (
        <div className="fixed bottom-4 flex items-center gap-16 justify-center py-4 bg-black w-full rounded-full">

            <Link href={'/chat/users'}>
                <span className={cn(
                    "flex flex-col items-center w-12 h-12 text-white cursor-pointer",
                    isActive("/chat/users") && "text-accent font-bold",
                )}>
                    <UserIcon />
                    <p className="text-xs">Users</p>
                </span>
            </Link>

            <Button variant="round" icon={<PlusIcon />} iconPosition="right" className="w-max h-full" />

            <Link href={'/chat/groups'}>
                <span className={cn(
                    "flex flex-col items-center w-12 h-12 text-white cursor-pointer",
                    isActive("/chat/groups") && "text-accent font-bold",
                )}>
                    <GroupIcon />
                    <p className="text-sm">Groups</p>
                </span>
            </Link>
        </div>
    )
}
