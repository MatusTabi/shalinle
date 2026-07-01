"use client";

import { Dialog } from "@/component/ui/Dialog";
import { useEffect, useState } from "react";
import { CompletionModalContent } from "./CompletionModalContent";
import type { CompletionModalProps } from "./completion-modal.type";

export function CompletionModal({ open }: CompletionModalProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsDismissed(false);
        }
    }, [open]);

    return (
        <Dialog open={open && !isDismissed} onOpenChange={(nextOpen) => setIsDismissed(!nextOpen)}>
            <CompletionModalContent />
        </Dialog>
    );
}
