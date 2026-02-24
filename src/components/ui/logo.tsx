import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    variant?: "default" | "white" | "dark";
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({
    className,
    variant = "default",
    showText = true,
    size = "md",
    ...props
}: LogoProps) {
    // Sizing map
    const sizeClasses = {
        sm: "h-6",
        md: "h-8",
        lg: "h-12",
        xl: "h-16",
    };

    const textClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-5xl",
    };

    // Color map based on variant
    const primaryColor = variant === "white" ? "#FFFFFF" : "#1E3A8A"; // Tailwind blue-900 / white
    const secondaryColor = variant === "white" ? "#E0F2FE" : "#3B82F6"; // Tailwind blue-500 / light blue
    const accentColor = variant === "white" ? "#FDE047" : "#D4AF37"; // Gold accent for swoosh
    const textColor = variant === "white" ? "text-white" : variant === "dark" ? "text-slate-900" : "text-white dark:text-white";

    return (
        <div className={cn("flex items-center gap-3 select-none", className)}>
            <svg
                className={cn("shrink-0", sizeClasses[size])}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                {/* Left pillar of M */}
                <path d="M15 30 L15 85 L30 85 L30 45 L50 65 L50 50 L30 30 Z" fill={primaryColor} />

                {/* Right pillar of M (Door structure) */}
                <path d="M70 30 L50 50 L50 85 L85 85 L85 30 Z" fill={primaryColor} />

                {/* The Open Door inside the right pillar */}
                <path d="M55 45 L55 80 L70 70 L70 55 Z" fill={secondaryColor} />
                <circle cx="67" cy="63" r="1.5" fill="#FFFFFF" />

                {/* Swoosh/Arrow cutting across */}
                <path
                    d="M10 55 Q 40 60 75 35 L85 25 L80 40 Q 40 70 10 55 Z"
                    fill={accentColor}
                    fillOpacity="0.9"
                />
                {/* Arrowhead */}
                <path d="M70 20 L90 20 L85 40 Z" fill={secondaryColor} />
            </svg>
            {showText && (
                <span
                    className={cn(
                        "font-extrabold tracking-widest",
                        textClasses[size],
                        textColor
                    )}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    MAKON
                </span>
            )}
        </div>
    );
}
