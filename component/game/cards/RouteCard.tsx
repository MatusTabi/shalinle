type RouteCardProps = {
    startStop: string;
    terminalStop: string;
    totalGuesses: number;
    routeProgress: string;
    isCompleted: boolean;
};

type RouteEndpointProps = {
    label: string;
    stopName: string;
    tone: "primary" | "secondary";
};

type RouteMetricProps = {
    label: string;
    value: string | number;
};

const RouteCard = ({ startStop, terminalStop, totalGuesses, routeProgress, isCompleted }: RouteCardProps) => (
    <section className="flex w-full flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-low/90 p-4 text-on-surface backdrop-blur">
        <RouteCardHeader isCompleted={isCompleted} />
        <div className="flex flex-col gap-3">
            <RouteEndpoint label="Origin" stopName={startStop} tone="secondary" />
            <RouteEndpoint label="Destination" stopName={terminalStop} tone="primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <RouteMetric label="Total Guesses" value={totalGuesses} />
            <RouteMetric label="Route Progress" value={routeProgress} />
        </div>
    </section>
);

const RouteCardHeader = ({ isCompleted }: { isCompleted: boolean }) => (
    <div className="flex items-center justify-between">
        <h2 className="mt-1 text-xl font-bold uppercase leading-7 text-on-surface">Current Route</h2>
        <span className="rounded-full border border-primary px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.12em] text-primary">
            {isCompleted ? "Complete" : "Live"}
        </span>
    </div>
);

const RouteEndpoint = ({ label, stopName, tone }: RouteEndpointProps) => {
    const markerClassName = tone === "primary" ? "bg-primary-container" : "bg-secondary-container";

    return (
        <div className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container p-3">
            <span className={`size-3 shrink-0 rounded-full ${markerClassName}`} aria-hidden="true" />
            <div className="min-w-0">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
                    {label}
                </span>
                <p className="truncate text-sm font-semibold uppercase text-on-surface">{stopName}</p>
            </div>
        </div>
    );
};

const RouteMetric = ({ label, value }: RouteMetricProps) => (
    <div className="rounded-md border border-outline-variant bg-surface-container-high p-3">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            {label}
        </span>
        <p className="mt-1 font-mono text-2xl font-semibold text-on-surface">{value}</p>
    </div>
);

export default RouteCard;
