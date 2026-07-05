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
    <section className="flex w-full flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-low/95 p-3 text-on-surface backdrop-blur lg:gap-4 lg:p-4">
        <RouteCardHeader isCompleted={isCompleted} />
        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-3">
            <RouteEndpoint label="Origin" stopName={startStop} tone="secondary" />
            <RouteEndpoint label="Destination" stopName={terminalStop} tone="primary" />
        </div>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
            <RouteMetric label="Total Guesses" value={totalGuesses} />
            <RouteMetric label="Route Progress" value={routeProgress} />
        </div>
    </section>
);

const RouteCardHeader = ({ isCompleted }: { isCompleted: boolean }) => (
    <div className="flex items-center justify-between">
        <h2 className="text-base font-bold uppercase leading-6 text-on-surface lg:mt-1 lg:text-xl lg:leading-7">
            Current Route
        </h2>
        <span className="rounded-full border border-primary px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-primary lg:px-3 lg:text-xs">
            {isCompleted ? "Complete" : "Live"}
        </span>
    </div>
);

const RouteEndpoint = ({ label, stopName, tone }: RouteEndpointProps) => {
    const markerClassName = tone === "primary" ? "bg-primary-container" : "bg-secondary-container";

    return (
        <div className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container p-2 lg:gap-3 lg:p-3">
            <span className={`size-2.5 shrink-0 rounded-full lg:size-3 ${markerClassName}`} aria-hidden="true" />
            <div className="min-w-0">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-on-surface-variant lg:text-xs">
                    {label}
                </span>
                <p className="truncate text-xs font-semibold uppercase text-on-surface lg:text-sm">{stopName}</p>
            </div>
        </div>
    );
};

const RouteMetric = ({ label, value }: RouteMetricProps) => (
    <div className="rounded-md border border-outline-variant bg-surface-container-high p-2 lg:p-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-on-surface-variant lg:text-xs">
            {label}
        </span>
        <p className="font-mono text-lg font-semibold text-on-surface lg:mt-1 lg:text-2xl">{value}</p>
    </div>
);

export default RouteCard;
