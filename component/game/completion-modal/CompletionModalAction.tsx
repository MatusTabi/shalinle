import { Button } from "@/component/ui/Button";
import type { ReactNode } from "react";

type CompletionModalActionProps = {
    children: ReactNode;
    variant?: "default" | "outline";
};

export function CompletionModalAction({ children, variant = "default" }: CompletionModalActionProps) {
    return (
        <Button className="w-full sm:w-auto" type="button" variant={variant}>
            {children}
        </Button>
    );
}
