import { NavigationLink } from "./NavigationLink";
import type { NavigationItem } from "./navigation.type";

const NAVIGATION_ITEMS: NavigationItem[] = [
    { label: "Daily", href: "/", disabled: true },
    { label: "Weekly", href: "#", disabled: true },
    { label: "Practice", href: "#", disabled: true },
    { label: "Map", href: "/", disabled: true },
];

export function NavigationMenu() {
    return (
        <nav aria-label="Primary navigation" className="flex items-center gap-1">
            {NAVIGATION_ITEMS.map((item) => (
                <NavigationLink key={item.label} item={item} />
            ))}
        </nav>
    );
}
