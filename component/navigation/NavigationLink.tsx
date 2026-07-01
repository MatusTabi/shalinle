import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "./navigation.type";

type NavigationLinkProps = {
    item: NavigationItem;
};

export function NavigationLink({ item }: NavigationLinkProps) {
    const className = cn(
        "rounded-md px-3 py-2 text-lg font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface",
        item.disabled && "pointer-events-none opacity-55",
    );

    if (item.disabled) {
        return (
            <span aria-disabled="true" className={className}>
                {item.label}
            </span>
        );
    }

    return (
        <Link className={className} href={item.href}>
            {item.label}
        </Link>
    );
}
