const RouteCard = () => (
    <section className="flex w-full items-center justify-between gap-4 rounded-lg border border-outline-variant/70 bg-surface-variant p-4 text-on-surface-variant">
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Current Route</h2>
            <span className="text-sm font-medium">Stop X</span>
            <span className="text-sm font-medium">Stop Y</span>
        </div>
        <div className="flex min-w-20 flex-col gap-2 rounded-lg">
            <span className="text-sm font-medium">Guesses</span>
            <span className="text-sm font-medium">3/5</span>
        </div>
    </section>
);

export default RouteCard;
