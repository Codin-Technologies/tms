import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'outline' | 'default' | 'danger';
}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
                variant === 'outline' && "bg-transparent",
                variant === 'danger' && "bg-red-100 text-red-700 border-red-200",
                className
            )}
            {...props}
        />
    )
}

export { Badge }
