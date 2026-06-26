import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
    { className, ...props },
    ref,
) {
    return (
        <input
            ref={ref}
            className={cn(
                "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface shadow-[0_0_32px_rgba(6,14,32,0.4)] outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-4 focus:ring-primary/20",
                className,
            )}
            {...props}
        />
    );
});
