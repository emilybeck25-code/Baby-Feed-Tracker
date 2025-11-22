import { useEffect, useMemo, useRef, useCallback } from 'react';

const ITEM_HEIGHT = 48;

export function WheelPicker({ value = 0, min = 0, max = 20, step = 1, label, onChange, onClose, onSave }) {
    const listRef = useRef(null);
    const lastAnnouncedRef = useRef(value);
    const values = useMemo(() => {
        const items = [];
        for (let v = min; v <= max; v += step) {
            items.push(Math.round(v * 100) / 100);
        }
        return items;
    }, [min, max, step]);

    const clampValue = useCallback(
        (input) => {
            const numeric = Number(input);
            if (!Number.isFinite(numeric)) return min;
            const clamped = Math.min(max, Math.max(min, numeric));
            const steps = Math.round((clamped - min) / step);
            return Math.round((min + steps * step) * 100) / 100;
        },
        [min, max, step]
    );

    useEffect(() => {
        if (!listRef.current) return;
        const pad = Math.max(0, (listRef.current.clientHeight - ITEM_HEIGHT) / 2);
        listRef.current.style.paddingTop = `${pad}px`;
        listRef.current.style.paddingBottom = `${pad}px`;
    }, []);

    useEffect(() => {
        if (!listRef.current) return;
        const target = clampValue(value);
        const idx = values.indexOf(target);
        if (idx === -1) return;
        listRef.current.scrollTo({
            top: idx * ITEM_HEIGHT,
            behavior: 'smooth',
        });
    }, [value, values, clampValue]);

    const vibrate = (nextVal) => {
        if (lastAnnouncedRef.current === nextVal) return;
        lastAnnouncedRef.current = nextVal;
        try {
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                navigator.vibrate(10);
            }
        } catch {
            // ignore haptic errors
        }
    };

    const handleScroll = () => {
        if (!listRef.current) return;
        const idx = Math.round(listRef.current.scrollTop / ITEM_HEIGHT);
        const safeIdx = Math.min(values.length - 1, Math.max(0, idx));
        const nextVal = values[safeIdx];
        if (nextVal === undefined) return;
        if (nextVal !== value && typeof onChange === 'function') {
            vibrate(nextVal);
            onChange(nextVal);
        }
    };

    const handleItemClick = (item) => {
        const target = clampValue(item);
        vibrate(target);
        if (typeof onChange === 'function') {
            onChange(target);
        }
    };

    const handleSave = () => {
        if (typeof onSave === 'function') {
            onSave();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm glass rounded-2xl p-4 bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        {label || 'Edit value'}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-sm font-semibold"
                        aria-label="Close picker"
                    >
                        Cancel
                    </button>
                </div>
                <div
                    className="relative h-64 overflow-y-scroll snap-y snap-mandatory px-2"
                    ref={listRef}
                    onScroll={handleScroll}
                >
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 pointer-events-none border-y border-slate-200/70 bg-gradient-to-b from-transparent via-white/70 to-transparent" />
                    <div className="space-y-1">
                        {values.map((item) => {
                            const isActive = item === value;
                            return (
                                <div
                                    key={item}
                                    className={`h-12 snap-center flex items-center justify-center rounded-lg text-lg font-semibold transition transform ${
                                        isActive
                                            ? 'bg-amber-100 text-amber-900 scale-[1.05]'
                                            : 'text-slate-700'
                                    }`}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-semibold shadow-sm hover:bg-amber-300"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
