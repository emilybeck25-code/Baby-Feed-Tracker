
export function MiniBarChart({
    title,
    subtitle,
    data,
    valueFormatter = value => value,
    gradient = 'linear-gradient(180deg, #a855f7 0%, #ec4899 100%)',
    shadowColor = 'rgba(168, 85, 247, 0.25)',
    accentLabel
}) {
    const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0);
    const safeMax = Math.max(maxValue, 1);
    const labelInterval = data.length <= 12 ? 1 : Math.ceil(data.length / 6);

    return (
        <div className="bg-white rounded-3xl shadow-[0_12px_30px_rgba(148,163,184,0.18)] border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                {accentLabel && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {accentLabel}
                    </span>
                )}
            </div>

            <div className="mt-4">
                <div className="h-36 flex items-end gap-[3px]">
                    {data.map((point, index) => {
                        const heightPercentage = (point.value / safeMax) * 100;
                        const formattedValue = valueFormatter(point.value);
                        const showLabel = index === 0 || index === data.length - 1 || index % labelInterval === 0;

                        return (
                            <div key={point.label} className="flex-1 flex flex-col items-center justify-end min-w-[6px]">
                                <div
                                    className="w-full rounded-t-xl transition-all duration-300 ease-out"
                                    style={{
                                        height: `${heightPercentage}%`,
                                        backgroundImage: gradient,
                                        boxShadow: `0 6px 14px ${shadowColor}`
                                    }}
                                    title={`${point.label}: ${formattedValue}`}
                                >
                                    <span className="sr-only">{formattedValue}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
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
