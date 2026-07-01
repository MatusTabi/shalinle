import Link from "next/link";

export function NavigationLogo() {
    return (
        <Link className="group flex items-center gap-3" href="/" aria-label="Shalinle home">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/40 bg-primary/15 shadow-[0_0_28px_rgba(142,213,255,0.18)] transition group-hover:bg-primary/20">
                <span className="h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-3xl font-semibold tracking-tight text-on-surface">Shalinle</span>
        </Link>
    );
}
