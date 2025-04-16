"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Button, Menu, Toggle, UsersDisplay } from "@/components";
import { SettingIcon } from "@/components/Icons/Setting";
import { UpdateUser } from "@/utils/api";
import { useState } from "react";

export default function Home() {
    const { user, isActive, toggleVisibility } = useUser();
    const [loading, setLoading] = useState(false);

    const changeVisibility = async () => {
        if (!user?.id) {
            console.error("User ID is not defined");
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await UpdateUser({
                id: user.id,
                visible: !user.visible, // Toggle visibility
            });

            console.log("User visibility updated:", updatedUser);
            toggleVisibility(); // Update context after success
        } catch (error) {
            console.error("Failed to update user visibility:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-8 gap-8 min-h-full min-w-screen md:min-w-[30rem]">
            <div className="flex w-full items-center justify-between">
                <div className="flex gap-2 items-center">
                    <Image
                        src={user?.image_url || ""}
                        width={400}
                        height={400}
                        alt={user?.username || ""}
                        className="w-16 h-16 rounded-full"
                    />
                    <div>
                        <h3 className="font-bold text-white">{user?.username}</h3>
                        <div className="flex items-center gap-1">
                            <div className={`${isActive ? 'bg-success' : 'bg-text'} w-2 h-2 rounded-full`}></div>
                            <p className={`${isActive ? 'text-success' : 'text-white/30'}`}>
                                {isActive ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                </div>

                <Button variant="link" icon={<SettingIcon />} iconPosition="right" />
            </div>

            <div className="flex w-full justify-between">
                <h2 className="text-lg text-white font-semibold">Groups</h2>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-text">Visibility</p>
                    <Toggle checked={user?.visible} onChange={changeVisibility} size="md" />
                </div>
            </div>

            <UsersDisplay />
            <Menu />
        </div>
    );
}