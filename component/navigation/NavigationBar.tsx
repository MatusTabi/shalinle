import { NavigationLogo } from "./NavigationLogo";
import { NavigationMenu } from "./NavigationMenu";

export function NavigationBar() {
    return (
        <header className="fixed inset-x-0 top-0 z-30 border-b border-outline-variant bg-surface/80 backdrop-blur-xl">
            <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <NavigationLogo />
                <NavigationMenu />
            </div>
        </header>
    );
}
