import { cn } from "@/utils/cn";
import React from "react";
import { MoonLoader } from "react-spinners";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    variant: "primary" | "secondary" | "tertiary" | "outline" | "dark-outline" | "link" | "round";
    size?: "sm" | "md" | "lg" | "xl";
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    disabled?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant, size, icon, iconPosition = "right", disabled, loading, children, className, ...props }) => {
    return (
        <button
            className={
                cn(
                    "flex w-max gap-2 justify-center items-center px-12 py-4 rounded-full cursor-pointer font-semibold font-[family-name:var(--font-inter)]",
                    variant === "primary" && "bg-primary dark:bg-accent text-white hover:bg-primary/80 dark:hover:bg-accent/80 transition-all",
                    variant === "secondary" && "bg-accent dark:bg-primary text-white hover:bg-accent/80 transition-all",
                    variant === "tertiary" && "bg-white text-primary hover:text-white hover:bg-accent/80 transition-all",
                    variant === "outline" && "border border-accent text-accent hover:bg-accent/10 transition-all",
                    variant === "dark-outline" && "border border-primary text-primary dark:border-white dark:text-white hover:bg-primary/10 transition-all",
                    variant === "link" && "px-4 text-accent hover:underline transition-all",
                    variant === "round" && "w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center",
                    size === "sm" && "text-sm",
                    size === "md" && "text-md",
                    size === "lg" && "text-lg",
                    size === "xl" && "text-xl",
                    className,
                )
            }
            {...props}
            disabled={disabled}
        >
            {icon && iconPosition === "left" &&
                <span
                    className={
                        cn(
                            "flex items-center justify-center w-4 h-4",
                            variant === "primary" && "text-white",
                            variant === "secondary" && "text-white",
                            variant === "outline" && "text-accent",
                            variant === "link" && "text-accent",
                        )
                    }
                >
                    {icon}
                </span>
            }
            {children}
            {icon && iconPosition === "right" &&
                <span
                    className={
                        cn(
                            "w-4 h-4",
                            variant === "primary" && "text-white",
                            variant === "secondary" && "text-white",
                            variant === "outline" && "text-accent",
                            variant === "link" && "text-accent",
                        )
                    }
                >
                    {icon}
                </span>
            }

            {loading &&
                <span className={"w-full flex items-center justify-center"}>
                    <MoonLoader size={20} color="white"/>
                </span>
            }
        </button>
    )
}