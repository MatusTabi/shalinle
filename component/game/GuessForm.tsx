"use client";

import { Button } from "@/component/ui/Button";
import { Input } from "@/component/ui/Input";
import { useEffect, useRef, useState } from "react";

type GuessFormProps = {
    availableStopNames: string[];
    disabled?: boolean;
    onGuess: (stopName: string) => void;
};

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export function GuessForm({ availableStopNames, disabled, onGuess }: GuessFormProps) {
    const [stopName, setStopName] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!disabled && window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
            inputRef.current?.focus({ preventScroll: true });
        }
    }, [disabled]);

    function focusInputOnDesktop() {
        if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
            inputRef.current?.focus({ preventScroll: true });
        }
    }

    return (
        <form
            className="flex gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-2"
            onSubmit={(event) => {
                event.preventDefault();

                if (!stopName.trim()) {
                    return;
                }

                onGuess(stopName);
                setStopName("");
                window.setTimeout(focusInputOnDesktop, 0);
            }}
        >
            <div className="min-w-0 flex-1">
                <Input
                    ref={inputRef}
                    aria-label="Guess a tram stop"
                    autoComplete="off"
                    disabled={disabled}
                    list="stop-names"
                    placeholder="Guess a stop"
                    className="border-outline bg-surface text-on-surface placeholder:text-on-surface-variant"
                    value={stopName}
                    onChange={(event) => setStopName(event.target.value)}
                    onBlur={() => {
                        if (!disabled) {
                            window.setTimeout(focusInputOnDesktop, 0);
                        }
                    }}
                />
                <datalist id="stop-names">
                    {availableStopNames.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
            </div>
            <Button
                className="shrink-0 bg-primary-container px-4 text-on-primary-container hover:bg-primary-container/90 sm:px-5"
                disabled={disabled || !stopName.trim()}
                type="submit"
            >
                Guess
            </Button>
        </form>
    );
}
