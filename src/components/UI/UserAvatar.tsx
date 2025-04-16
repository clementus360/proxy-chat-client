"use client";
import { useSocket } from "@/context/SocketContext";
import { debugMessages, getUnreadCount } from "@/utils/db";
import { Message, NewMessage } from "@/utils/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  username: string;
  image_url: string;
}

export default function UserAvatar({ user }: { user: User }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { registerMessageCallback, isConnected } = useSocket();

  const fetchUnread = useCallback(async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser?.id;

    if (!currentUserId) return;

    let isMounted = true;

    try {
      const count = await getUnreadCount(user.id, currentUserId);
      if (isMounted) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  // Message handler for socket messages
  const handleNewMessage = useCallback((newMessage: NewMessage) => {
    console.log(`UserAvatar(${user.id}) received message:`, newMessage);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser?.id;

    if (!currentUserId) {
      console.error("Current user ID not found when handling new message");
      return;
    }

    // Update unread count when:
    // 1. Message is from this remote user (sender_id === user.id)
    // 2. Message is to current user (receiver_id === currentUserId)
    if (
      (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) &&
      newMessage.receiver_type === "user"
    ) {
      fetchUnread();
    }
  }, [user.id, fetchUnread]);

  useEffect(() => {
    console.log(`UserAvatar(${user.id}) initializing...`);

    // Initial fetch of unread count
    fetchUnread();

    // Register callback for new messages
    console.log(`UserAvatar(${user.id}) registering message callback...`);
    const unregister = registerMessageCallback(handleNewMessage);

    console.log(`UserAvatar(${user.id}) callback registered`);

    // Cleanup: unregister the callback when component unmounts
    return () => {
      console.log(`UserAvatar(${user.id}) unregistering callback...`);
      unregister();
    };
  }, [user.id, registerMessageCallback, fetchUnread, handleNewMessage]);

  // Also re-fetch when socket connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log(`UserAvatar(${user.id}) socket connected, fetching unread count...`);
      fetchUnread();
    }
  }, [isConnected, fetchUnread, user.id]);

  useEffect(() => {
    setInterval(() => {
      fetchUnread()
    }, 2000);
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/chat/users/${user.id}`);
  };

  return (
    <div onClick={handleClick} className="relative h-auto cursor-pointer group">
      {/* Avatar image with hover effects */}
      <div className="relative rounded-full p-1 transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:shadow-lg group-hover:scale-105">
        <Image
          src={user.image_url}
          width={100}
          height={100}
          alt={user.username}
          className="rounded-full object-cover aspect-square transition-all duration-300 group-hover:brightness-90"
        />

        {/* Overlay effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Small decorative dots that appear on hover */}
      <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 transform translate-x-1/2 translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-200"></div>
      <div className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-pink-400 transform -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-300"></div>

      {/* Enhanced notification badge with bounce effect */}
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300 animate-bounce shadow-md">
          {unreadCount}
        </span>
      )}

      {/* Username tooltip that appears on hover with slide-up animation */}
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 translate-y-2 group-hover:translate-y-0 bg-gray-800 text-white text-xs py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
        {user.username}
      </span>

      {/* Status indicator */}
      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
    </div>
  );
}