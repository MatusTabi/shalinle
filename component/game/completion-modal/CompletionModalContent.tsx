import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/component/ui/Dialog";
import { CompletionModalAction } from "./CompletionModalAction";

type CompletionModalContentProps = {
    onPlayAnother: () => void;
};

export function CompletionModalContent({ onPlayAnother }: CompletionModalContentProps) {
    return (
        <DialogContent className="border-outline-variant bg-surface-container text-on-surface shadow-[0_24px_120px_rgba(0,0,0,0.65)] sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-2xl font-semibold tracking-tight text-on-surface">
                    Path completed
                </DialogTitle>
                <DialogDescription className="text-on-surface-variant">
                    You connected the starting stop to the terminal stop.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:space-x-0">
                <CompletionModalAction onClick={onPlayAnother}>Play another</CompletionModalAction>
                <CompletionModalAction variant="outline">See results</CompletionModalAction>
            </DialogFooter>
        </DialogContent>
    );
}
