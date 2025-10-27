export function DualMetricChart({ title, subtitle, data, formatDuration = (value) => value }) {
    // DEBUG: Log what data we're receiving
    console.log('🎨 DualMetricChart render:', {
        title,
        dataLength: data.length,
        firstPoint: data[0],
        lastPoint: data[data.length - 1],
    });

    const maxFeedCount = data.reduce((max, point) => Math.max(max, point.feedCount), 0);
    const maxDuration = data.reduce((max, point) => Math.max(max, point.duration), 0);
    const safeMaxFeedCount = Math.max(maxFeedCount, 1);
    const safeMaxDuration = Math.max(maxDuration, 1);

    console.log('🎨 DualMetricChart maxValues:', {
        maxFeedCount,
        maxDuration,
        safeMaxFeedCount,
        safeMaxDuration,
    });

    const labelInterval = data.length <= 12 ? 1 : Math.ceil(data.length / 6);

    return (
        <div className="bg-white rounded-3xl shadow-[0_12px_30px_rgba(148,163,184,0.18)] border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div className="flex gap-2 text-[10px]">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-violet-400 to-violet-500"></div>
                        <span className="text-slate-500">Count</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-sky-400 to-indigo-500"></div>
                        <span className="text-slate-500">Time</span>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="h-36 flex items-end gap-[3px]">
                    {data.map((point, index) => {
                        const feedCountHeight = (point.feedCount / safeMaxFeedCount) * 100;
                        const durationHeight = (point.duration / safeMaxDuration) * 100;
                        const showLabel =
                            index === 0 || index === data.length - 1 || index % labelInterval === 0;

                        // DEBUG: Log first 3 bars
                        if (index < 3) {
                            console.log(`🎨 Bar ${index} (${point.label}):`, {
                                feedCount: point.feedCount,
                                duration: point.duration,
                                feedCountHeight: `${feedCountHeight}%`,
                                durationHeight: `${durationHeight}%`,
                            });
                        }

                        // Show both metrics in the tooltip
                        const tooltipText = `${point.label}: ${point.feedCount} feed${point.feedCount === 1 ? '' : 's'}, ${formatDuration(point.duration)}`;

                        return (
                            <div
                                key={point.label}
                                className="flex-1 flex flex-col items-center justify-end min-w-[6px]"
                                title={tooltipText}
                            >
                                <div className="w-full h-full flex gap-[1px] items-end justify-center">
                                    {/* Feed count bar */}
                                    <div
                                        className="flex-1 rounded-t-xl transition-all duration-300 ease-out"
                                        style={{
                                            height: `${feedCountHeight}%`,
                                            backgroundImage:
                                                'linear-gradient(180deg, #c084fc 0%, #a855f7 100%)',
                                            boxShadow: '0 4px 10px rgba(168, 85, 247, 0.25)',
                                        }}
                                    >
                                        <span className="sr-only">{point.feedCount} feeds</span>
                                    </div>

                                    {/* Duration bar */}
                                    <div
                                        className="flex-1 rounded-t-xl transition-all duration-300 ease-out"
                                        style={{
                                            height: `${durationHeight}%`,
                                            backgroundImage:
                                                'linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)',
                                            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.22)',
                                        }}
                                    >
                                        <span className="sr-only">
                                            {formatDuration(point.duration)}
                                        </span>
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="mt-1 text-[10px] text-slate-400 text-center">
                                    {showLabel ? point.label : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
