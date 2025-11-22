import { useState, useEffect, useRef, useMemo } from 'react';
import Picker from 'react-mobile-picker';

export function WheelPicker({
    value = 0,
    min = 0,
    max = 20,
    step = 1,
    label,
    onChange,
    onClose,
    onSave,
}) {
    const lastAnnouncedRef = useRef(value);

    // Generate array of values for the picker
    const values = useMemo(() => {
        const items = [];
        for (let v = min; v <= max; v += step) {
            items.push(Math.round(v * 100) / 100);
        }
        return items;
    }, [min, max, step]);

    // Initialize picker value in the format react-mobile-picker expects
    const [pickerValue, setPickerValue] = useState({ number: value });

    // Update picker when external value changes
    useEffect(() => {
        setPickerValue({ number: value });
    }, [value]);

    // Prevent body scroll when picker is open (critical for iOS)
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const scrollY = window.scrollY;

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            // Restore body scroll
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

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

    const handleChange = (newValue) => {
        setPickerValue(newValue);
        const numericValue = newValue.number;
        vibrate(numericValue);
        if (typeof onChange === 'function') {
            onChange(numericValue);
        }
    };

    const handleSave = () => {
        if (typeof onSave === 'function') {
            onSave();
        }
    };

    const handleBackdropKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 touch-none"
            onClick={onClose}
            onKeyDown={handleBackdropKeyDown}
            role="presentation"
            style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
            }}
        >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className="relative w-full max-w-sm glass rounded-2xl p-4 bg-white touch-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-3">
                    <div
                        id="picker-label"
                        className="text-sm font-semibold text-slate-500 uppercase tracking-wide"
                    >
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

                <div className="relative h-64 overflow-hidden">
                    {/* Highlight overlay */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 pointer-events-none border-y border-slate-200/70 bg-gradient-to-b from-transparent via-white/70 to-transparent z-10" />

                    {/* Picker component */}
                    <Picker
                        value={pickerValue}
                        onChange={handleChange}
                        wheelMode="natural"
                        height={256}
                        itemHeight={48}
                    >
                        <Picker.Column name="number">
                            {values.map((item) => (
                                <Picker.Item key={item} value={item}>
                                    {({ selected }) => (
                                        <div
                                            className={`h-12 flex items-center justify-center text-lg font-semibold transition-all ${
                                                selected
                                                    ? 'text-amber-900 scale-110'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            {item}
                                        </div>
                                    )}
                                </Picker.Item>
                            ))}
                        </Picker.Column>
                    </Picker>
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
