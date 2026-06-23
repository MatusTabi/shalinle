import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-[0_0_24px_rgba(142,213,255,0.18)] transition hover:bg-primary-fixed-dim disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        />
    );
}
