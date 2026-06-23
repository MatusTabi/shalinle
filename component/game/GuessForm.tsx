"use client";

import { Button } from "@/component/ui/Button";
import { Input } from "@/component/ui/Input";
import { useState } from "react";

type GuessFormProps = {
    availableStopNames: string[];
    disabled?: boolean;
    onGuess: (stopName: string) => void;
};

export function GuessForm({ availableStopNames, disabled, onGuess }: GuessFormProps) {
    const [stopName, setStopName] = useState("");

    return (
        <form
            className="flex gap-2"
            onSubmit={(event) => {
                event.preventDefault();

                if (!stopName.trim()) {
                    return;
                }

                onGuess(stopName);
                setStopName("");
            }}
        >
            <div className="min-w-0 flex-1">
                <Input
                    aria-label="Guess a tram stop"
                    autoComplete="off"
                    disabled={disabled}
                    list="stop-names"
                    placeholder="Guess a stop"
                    value={stopName}
                    onChange={(event) => setStopName(event.target.value)}
                />
                <datalist id="stop-names">
                    {availableStopNames.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
            </div>
            <Button className="shrink-0 px-4 sm:px-5" disabled={disabled || !stopName.trim()} type="submit">
                Guess
            </Button>
        </form>
    );
}
