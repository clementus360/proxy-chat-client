"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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

// Separate interface for positioned users
interface PositionedUser extends User {
    posX: number;
    posY: number;
}

export function UsersDisplay() {
    const [positionedUsers, setPositionedUsers] = useState<PositionedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const { user } = useUser();
    const { setChat } = useChat();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const hasMeasuredContainer = useRef(false);

    // Store user position map in ref to avoid dependency issues
    const userPositionsRef = useRef<Record<number, { posX: number, posY: number }>>({});

    // Initial container measurement - only done once
    useEffect(() => {
        if (containerRef.current && !hasMeasuredContainer.current) {
            // Get the initial size
            const width = containerRef.current.offsetWidth;
            const height = Math.max(containerRef.current.offsetHeight, 500); // Minimum height

            setContainerSize({ width, height });
            hasMeasuredContainer.current = true;
        }
    }, []);

    // Function to position a new user without overlap
    const positionNewUser = useCallback((newUser: User, existingUsers: PositionedUser[], width: number, height: number): PositionedUser => {
        const avatarSize = 100; // Size of avatar + some padding
        const minDistance = avatarSize; // Minimum distance between avatars

        // Border padding to keep avatars fully in view
        const padding = 50;
        const safeWidth = Math.max(width - padding * 2, 300);
        const safeHeight = Math.max(height - padding * 2, 300);

        let attempts = 0;
        let posX = 0;
        let posY = 0;
        let validPosition = false;

        // Try to find a non-overlapping position
        while (!validPosition && attempts < 100) {
            // Random position with padding - use percentage of container size
            // This way positions are relative and will scale better
            const relativeX = padding + Math.random() * safeWidth;
            const relativeY = padding + Math.random() * safeHeight;

            posX = relativeX;
            posY = relativeY;

            // Check against existing positioned users
            validPosition = true;
            for (const positioned of existingUsers) {
                const dx = posX - positioned.posX;
                const dy = posY - positioned.posY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    validPosition = false;
                    break;
                }
            }

            attempts++;
        }

        return { ...newUser, posX, posY };
    }, []);

    const fetchUsers = useCallback(async () => {
        if (!user?.latitude || !user?.longitude || !user.id || containerSize.width <= 0) {
            return;
        }

        try {
            setLoading(true);
            const fetchedUsers: User[] = await GetUsers(user.latitude, user.longitude, 5, user.id);

            // Create updated user list
            const updatedPositionedUsers: PositionedUser[] = [];

            // Process each fetched user
            for (const fetchedUser of fetchedUsers) {
                // Check if we already have a position for this user
                if (userPositionsRef.current[fetchedUser.id]) {
                    // Use existing position
                    updatedPositionedUsers.push({
                        ...fetchedUser,
                        posX: userPositionsRef.current[fetchedUser.id].posX,
                        posY: userPositionsRef.current[fetchedUser.id].posY
                    });
                } else {
                    // This is a new user, calculate position
                    const newPositionedUser = positionNewUser(
                        fetchedUser,
                        updatedPositionedUsers,
                        containerSize.width,
                        containerSize.height
                    );

                    // Save position for future reference
                    userPositionsRef.current[fetchedUser.id] = {
                        posX: newPositionedUser.posX,
                        posY: newPositionedUser.posY
                    };

                    updatedPositionedUsers.push(newPositionedUser);
                }
            }

            setPositionedUsers(updatedPositionedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.latitude, user?.longitude, positionNewUser, containerSize]);

    useEffect(() => {
        if (containerSize.width > 0) {
            fetchUsers();
            const interval = setInterval(fetchUsers, 5000); // Refresh every 5 seconds

            return () => {
                clearInterval(interval);
            };
        }
    }, [fetchUsers, containerSize]);

    const openChat = (user: PositionedUser) => {
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
        <div
            ref={containerRef}
            className="w-full min-h-[32rem] relative bg-slate-800/40 rounded-lg p-4 overflow-hidden"
        >
            {/* Radar pulse animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-indigo-500/5 animate-ping"></div>
                <div className="absolute w-64 h-64 rounded-full bg-indigo-500/5 animate-ping" style={{ animationDelay: "0.5s" }}></div>
                <div className="absolute w-96 h-96 rounded-full bg-indigo-500/5 animate-ping" style={{ animationDelay: "1s" }}></div>
            </div>

            {loading && positionedUsers.length === 0 ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-white/50 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400 mb-4"></div>
                    <p className="text-sm md:text-base">Scanning for nearby users...</p>
                </div>
            ) : positionedUsers.length === 0 ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/40 p-8 z-10">
                    <p className="text-lg font-semibold mb-2">No users found nearby</p>
                    <p className="text-sm md:text-base">Try again in a few moments</p>
                </div>
            ) : (
                <>
                    {positionedUsers.map((user) => (
                        <div
                            key={user.id}
                            className="absolute transition-all duration-500 hover:scale-110 z-20"
                            style={{
                                left: `${user.posX}px`,
                                top: `${user.posY}px`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <button
                                onClick={() => openChat(user)}
                                className="relative"
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