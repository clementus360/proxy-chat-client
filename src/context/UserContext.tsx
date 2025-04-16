"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: number;
    username: string;
    image_url: string;
    latitude: number;
    longitude: number;
    created_at: string;
    last_active: string;
    visible: boolean;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUser: (userData: Partial<User>) => void;
    toggleVisibility: () => void;
    isActive: boolean;
    setIsActive: (active: boolean) => void;
    isLoggedIn: boolean;
    removeUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [isActive, setIsActiveState] = useState<boolean>(false);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserState(JSON.parse(storedUser));
        } else {
            router.push("/sign-in");
        }
    }, []);

    // Save user to localStorage whenever it changes
    const setUser = (userData: User | null) => {
        setUserState(userData);
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
        } else {
            localStorage.removeItem("user");
        }
    };

    // Function to update specific user fields
    const updateUser = (userData: Partial<User>) => {
        setUserState((prevUser) => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, ...userData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    // Toggle user visibility
    const toggleVisibility = () => {
        setUserState((prevUser) => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, visible: !prevUser.visible };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const setIsActive = (active: boolean) => {
        setIsActiveState(active);
    };

    const removeUser = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                updateUser,
                toggleVisibility,
                removeUser,
                isActive,
                setIsActive,
                isLoggedIn: !!user,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};