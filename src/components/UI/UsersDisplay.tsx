"use client";
import { useEffect, useState } from "react";
import { GetUsers } from "@/utils/api";
import UserAvatar from "./UserAvatar";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";

// Define user type based on the API response
interface User {
    id: number;
    username: string;
    image_url: string;
    visible: boolean;
    online: boolean;
    last_active: string;
    created_at: string;
}

export function UsersDisplay() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { setChat } = useChat();
    const router = useRouter();

    const fetchUsers = async () => {
        if (!user?.latitude || !user?.longitude || !user.id) {
            console.error("User data not found");
            return;
        }

        try {
            setLoading(true);
            const usersData: User[] = await GetUsers(user.latitude, user.longitude, 5, user.id);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [user?.id]);

    const openChat = (user: User) => {
        console.log("Opening chat with user:", user);
        setChat({
            id: user.id.toString(),
            username: user.username,
            image_url: user.image_url,
            online: user.online,
            visible: user.visible,
            last_active: user.last_active,
            created_at: user.created_at,
        });
        router.push(`/chat/users/${user.id}`);
    };

    return (
        <div className="w-full min-h-[32rem] rounded-lg p-4 flex flex-wrap justify-center items-center gap-8">
            {loading && users.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-white/50">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400 mb-4"></div>
                    <p className="text-sm md:text-base">Looking for nearby users...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center text-white/40 p-8">
                    <p className="text-lg font-semibold mb-2">No users found nearby</p>
                    <p className="text-sm md:text-base">Try again in a few moments</p>
                </div>
            ) : (
                <>
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="transition-transform hover:scale-105 duration-200"
                        >
                            <button
                                onClick={() => openChat(user)}
                                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                                aria-label={`Chat with ${user.username}`}
                            >
                                <UserAvatar user={user} />
                            </button>
                        </div>
                    ))}
                    
                </>
            )}
        </div>
    );
}