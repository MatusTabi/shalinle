import { Button } from "@/component/ui/Button";
import type { ReactNode } from "react";

type CompletionModalActionProps = {
    children: ReactNode;
    onClick?: () => void;
    variant?: "default" | "outline";
};

export function CompletionModalAction({ children, onClick, variant = "default" }: CompletionModalActionProps) {
    return (
        <Button className="w-full sm:w-auto" type="button" variant={variant} onClick={onClick}>
            {children}
        </Button>
    );
}
