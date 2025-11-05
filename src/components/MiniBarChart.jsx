export function MiniBarChart({
    title,
    subtitle,
    data,
    valueFormatter = (value) => value,
    gradient = 'linear-gradient(180deg, #a855f7 0%, #ec4899 100%)',
    shadowColor = 'rgba(168, 85, 247, 0.25)',
    accentLabel,
}) {
    const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0);
    const safeMax = Math.max(maxValue, 1);
    const labelInterval = data.length <= 12 ? 1 : Math.ceil(data.length / 6);

    return (
        <div className="glass rounded-3xl p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                {accentLabel && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 glass-chip px-2 py-1">
                        {accentLabel}
                    </span>
                )}
            </div>

            <div className="mt-4">
                <div className="h-36 flex items-end gap-[3px]">
                    {data.map((point, index) => {
                        const heightPercentage = (point.value / safeMax) * 100;
                        const formattedValue = valueFormatter(point.value);
                        const showLabel =
                            index === 0 || index === data.length - 1 || index % labelInterval === 0;

                        return (
                            <div
                                key={point.label}
                                className="flex-1 h-full flex flex-col min-w-[6px] overflow-hidden"
                            >
                                {/* Bar area gets all remaining height */}
                                <div className="flex-1 w-full flex items-end justify-center">
                                    <div
                                        className="w-full rounded-t-xl transition-all duration-300 ease-out"
                                        style={{
                                            height: `${heightPercentage}%`,
                                            backgroundImage: gradient,
                                            boxShadow: `0 6px 14px ${shadowColor}`,
                                        }}
                                        title={`${point.label}: ${formattedValue}`}
                                    >
                                        <span className="sr-only">{formattedValue}</span>
                                    </div>
                                </div>
                                {/* Fixed-height label row so bars stay aligned */}
                                <div className="mt-1 h-4 text-[10px] text-slate-400 text-center leading-4">
                                    {showLabel ? point.label : '\u00A0'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
