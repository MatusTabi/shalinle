import type { GuessResultDto } from "@/backend/dto/guess/dto";

type RecentGuessListProps = {
    guesses: GuessResultDto[];
};

const guessStatusLabels: Record<GuessResultDto["status"], string> = {
    "correct-neighbor": "Linked",
    "gray-connected": "Connected",
    duplicate: "Duplicate",
    isolated: "Isolated",
    unknown: "Unknown",
};

export const RecentGuessList = ({ guesses }: RecentGuessListProps) => (
    <div className="flex flex-col gap-3 rounded-md border border-outline-variant bg-surface-container p-3">
        <div>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
                Recent Guesses
            </span>
            {guesses.length > 0 ? (
                <div className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                    {guesses.map((guess, index) => (
                        <div
                            key={`${guess.stopName}-${index}`}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <span className="truncate font-medium text-on-surface">{guess.stopName}</span>
                            <span className="shrink-0 rounded-full bg-surface-container-highest px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">
                                {guessStatusLabels[guess.status]}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-3 text-sm text-on-surface-variant">No guesses yet.</p>
            )}
        </div>
    </div>
);
