"use client";
import { cn } from "@/utils/cn";
import { useState } from "react";

interface ToggleProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: "sm" | "md" | "lg";
}

export const Toggle: React.FC<ToggleProps> = ({ checked = false, onChange, size = "md" }) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleToggle = () => {
        const newState = !isChecked;
        setIsChecked(newState);
        onChange?.(newState);
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "relative flex items-center rounded-full transition-all",
                size === "sm" && "w-10 h-5",
                size === "md" && "w-12 h-6",
                size === "lg" && "w-16 h-8",
                isChecked ? "bg-green-500" : "bg-gray-400"
            )}
        >
            <span
                className={cn(
                    "absolute rounded-full bg-white shadow-md transition-all",
                    size === "sm" && "w-4 h-4 left-0.5 top-0.5",
                    size === "md" && "w-5 h-5 left-0.5 top-0.5",
                    size === "lg" && "w-7 h-7 left-1 top-1",
                    isChecked ? "translate-x-full" : "translate-x-0"
                )}
            />
        </button>
    );
};