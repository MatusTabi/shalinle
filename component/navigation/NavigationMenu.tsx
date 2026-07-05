"use client";

import { useState } from "react";
import { NavigationLink } from "./NavigationLink";
import type { NavigationItem } from "./navigation.type";

const NAVIGATION_ITEMS: NavigationItem[] = [
    { label: "Daily", href: "/", disabled: true },
    { label: "Weekly", href: "#", disabled: true },
    { label: "Practice", href: "#", disabled: true },
    { label: "Map", href: "/", disabled: true },
];

export function NavigationMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
                {NAVIGATION_ITEMS.map((item) => (
                    <NavigationLink key={item.label} item={item} />
                ))}
            </nav>
            <button
                aria-controls="mobile-navigation-menu"
                aria-expanded={isOpen}
                aria-label="Toggle navigation menu"
                className="flex size-10 flex-col items-center justify-center gap-1.5 rounded-md border border-outline-variant bg-surface-container text-on-surface transition hover:border-primary md:hidden"
                type="button"
                onClick={() => setIsOpen((current) => !current)}
            >
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
            </button>
            {isOpen ? (
                <nav
                    id="mobile-navigation-menu"
                    aria-label="Mobile navigation"
                    className="absolute right-0 top-12 flex w-48 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-[2px_2px_0_var(--outline-variant)] md:hidden"
                >
                    {NAVIGATION_ITEMS.map((item) => (
                        <NavigationLink key={item.label} item={item} />
                    ))}
                </nav>
            ) : null}
        </div>
    );
}
