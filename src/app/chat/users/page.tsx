"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Button, Menu, Toggle, UsersDisplay, UserSettingsModal } from "@/components";
import { SettingIcon } from "@/components/Icons/Setting";
import { UpdateUser } from "@/utils/api";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export default function Home() {
    const { user, toggleVisibility } = useUser();
    const { isConnected } = useSocket();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        if (user) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [user])

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen min-w-screen">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start px-4 md:px-8 py-8 gap-10 w-full md:min-w-[50%] min-h-screen md:h-screen bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex w-full items-center justify-between">
                <div className="flex gap-4 items-center">
                    <Image
                        src={user?.image_url || "https://api.dicebear.com/9.x/bottts/png"}
                        width={400}
                        height={400}
                        alt={user?.username || "Avatar"}
                        className="object-cover w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/10 shadow"
                    />
                    <div className="flex flex-col">
                        <h3 className="font-bold text-white text-base md:text-lg">{user?.username}</h3>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-white/30'
                                    }`}
                            ></div>
                            <p className={`text-sm ${isConnected ? 'text-green-400' : 'text-white/30'}`}>
                                {isConnected ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    variant="link"
                    icon={<SettingIcon />}
                    onClick={openModal}
                    iconPosition="right"
                    className="hover:text-white/80 text-white/60"
                />
            </div>

            {/* Title & toggle */}
            <div className="flex w-full justify-between items-center border-b border-white/10 pb-2">
                <h2 className="text-lg md:text-xl text-white font-semibold tracking-tight">
                    Nearby Users
                </h2>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-white/50">Visibility</p>
                    <Toggle
                        checked={user?.visible}
                        onChange={changeVisibility}
                        size="md"
                    />
                </div>
            </div>

            {/* User List */}
            <div className="w-full flex-1 overflow-y-auto">
                <UsersDisplay />
            </div>

            {/* Modal */}
            <UserSettingsModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
}