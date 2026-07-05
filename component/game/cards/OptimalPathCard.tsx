import type { StopDto } from "@/backend/dto/stop/dto";

type OptimalPathCardProps = {
    stops: StopDto[];
};

export const OptimalPathCard = ({ stops }: OptimalPathCardProps) => (
    <div className="rounded-md border border-outline-variant bg-surface-container p-3">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            Optimal Path
        </span>
        <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-container font-mono text-[10px] font-semibold text-on-primary-container">
                        {index + 1}
                    </span>
                    <span className="min-w-0 truncate font-medium text-on-surface">{stop.name}</span>
                </div>
            ))}
        </div>
    </div>
);
