import { useState, useRef, useEffect, useMemo } from 'react';
import { FeedingSide } from '../utils/constants';
import { formatTime } from '../utils/timeFormatting';
import { TimerDisplay } from './TimerDisplay';
import { WheelPicker } from './WheelPicker';

export function HistoryLog({ chronologicalHistory, onDelete, onEdit }) {
    const [openItemId, setOpenItemId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingSide, setEditingSide] = useState(null);
    const [editType, setEditType] = useState(null);
    const [editValue, setEditValue] = useState(null);
    const [originalValue, setOriginalValue] = useState(null);
    const [isPickerOpen, setPickerOpen] = useState(false);
    const [pickerLabel, setPickerLabel] = useState('');
    const touchStartXRef = useRef(0);
    const pointerItemRef = useRef(null);

    useEffect(() => {
        if (openItemId === null) return;
        const stillExists = chronologicalHistory.some((unit) => unit.id === openItemId);
        if (!stillExists) {
            setOpenItemId(null);
        }
    }, [chronologicalHistory, openItemId]);

    const resetEditing = () => {
        setEditingItemId(null);
        setEditingSide(null);
        setEditType(null);
        setEditValue(null);
        setOriginalValue(null);
        setPickerOpen(false);
        setPickerLabel('');
    };

    const handleTouchStart = (event, unitId) => {
        if (editingItemId && editingItemId !== unitId) {
            resetEditing();
            setOpenItemId(null);
            return;
        }
        if (event.touches.length !== 1) return;
        touchStartXRef.current = event.touches[0].clientX;
        pointerItemRef.current = unitId;
    };

    const handleTouchEnd = (event, unitId) => {
        if (pointerItemRef.current !== unitId) return;
        const endX = event.changedTouches[0].clientX;
        const deltaX = endX - touchStartXRef.current;
        if (deltaX < -50) {
            setOpenItemId(unitId);
        } else if (deltaX > 50 && openItemId === unitId) {
            setOpenItemId(null);
        } else if (Math.abs(deltaX) < 10 && openItemId === unitId) {
            setOpenItemId(null);
        }
        pointerItemRef.current = null;
    };

    const mouseStartXRef = useRef(0);

    const handleMouseDown = (event, unitId) => {
        if (editingItemId && editingItemId !== unitId) {
            resetEditing();
            setOpenItemId(null);
            return;
        }
        mouseStartXRef.current = event.clientX;
        pointerItemRef.current = unitId;
    };

    const handleMouseUp = (event, unitId) => {
        if (pointerItemRef.current !== unitId) return;
        const deltaX = event.clientX - mouseStartXRef.current;
        if (deltaX < -40) {
            setOpenItemId(unitId);
        } else if (deltaX > 40 && openItemId === unitId) {
            setOpenItemId(null);
        } else if (Math.abs(deltaX) < 6 && openItemId === unitId) {
            setOpenItemId(null);
        }
        pointerItemRef.current = null;
    };

    const handleDelete = (unitId) => {
        setOpenItemId(null);
        if (editingItemId === unitId) {
            resetEditing();
        }
        if (typeof onDelete === 'function') {
            onDelete(unitId);
        }
    };

    if (chronologicalHistory.length === 0) {
        return <div className="text-slate-500 text-center py-8">No feedings logged yet.</div>;
    }

    const editingUnit = useMemo(
        () => chronologicalHistory.find((unit) => unit.id === editingItemId) || null,
        [chronologicalHistory, editingItemId]
    );

    useEffect(() => {
        if (editingItemId && !editingUnit) {
            resetEditing();
        }
    }, [editingItemId, editingUnit]);

    const handleStartEdit = (unit, isBottle) => {
        if (!unit || unit.isActive) return;
        setOpenItemId(null);
        setEditingItemId(unit.id);
        setEditType(isBottle ? 'bottle' : 'breast');
        setEditingSide(null);
        setPickerOpen(false);
        setPickerLabel('');
        if (isBottle) {
            const ozField = Number(unit.volumeOz);
            const mlLegacy = Number(unit.volumeMl ?? 0);
            const volOz = Number.isFinite(ozField)
                ? ozField
                : Number.isFinite(mlLegacy)
                  ? mlLegacy / 29.5735
                  : 0;
            const rounded = Math.min(20, Math.max(0, Math.round(volOz)));
            setEditValue(rounded);
            setOriginalValue(rounded);
            setPickerLabel('Edit bottle (oz)');
            setPickerOpen(true);
        } else {
            setEditValue(null);
            setOriginalValue(null);
        }
    };

    const handleBubbleSelect = (unit, side) => {
        if (!unit || unit.id !== editingItemId || editType !== 'breast') return;
        const sessions = Array.isArray(unit.sessions) ? unit.sessions : [];
        const existing = sessions.find((s) => s?.side === side);
        const durationSeconds = existing?.duration ?? 0;
        const roundedMinutes = Math.min(20, Math.max(0, Math.round(durationSeconds / 60)));
        setEditingSide(side);
        setEditValue(roundedMinutes);
        setOriginalValue(roundedMinutes);
        setPickerLabel(`Edit ${side === FeedingSide.Left ? 'Left' : 'Right'} side (minutes)`);
        setPickerOpen(true);
    };

    const handleSave = () => {
        if (!editingItemId || editValue === null || editValue === undefined) {
            resetEditing();
            return;
        }
        const valueNumber = Number(editValue);
        if (!Number.isFinite(valueNumber)) {
            resetEditing();
            return;
        }
        const clamped = Math.min(20, Math.max(0, Math.round(valueNumber)));
        const changed = originalValue === null ? true : clamped !== originalValue;
        if (changed && typeof onEdit === 'function') {
            if (editType === 'breast' && editingSide) {
                onEdit(editingItemId, {
                    type: 'breast',
                    side: editingSide,
                    durationSeconds: clamped * 60,
                });
            } else if (editType === 'bottle') {
                onEdit(editingItemId, {
                    type: 'bottle',
                    volumeOz: clamped,
                });
            }
        }
        resetEditing();
    };

    const handleCancel = () => {
        resetEditing();
    };

    const isEditing = (unitId) => editingItemId === unitId;

    const groupedByDay = {};
    chronologicalHistory.forEach((unit) => {
        const date = new Date(unit.endTime);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dayLabel;
        if (date.toDateString() === today.toDateString()) {
            dayLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dayLabel = 'Yesterday';
        } else {
            dayLabel = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            });
        }

        if (!groupedByDay[dayLabel]) {
            groupedByDay[dayLabel] = [];
        }
        groupedByDay[dayLabel].push(unit);
    });

    return (
        <div className="space-y-4">
            {Object.entries(groupedByDay).map(([day, units]) => (
                <div key={day} className="glass p-4 rounded-2xl">
                    <h3 className="font-bold text-slate-800 mb-3">{day}</h3>
                    <div className="space-y-3">
                        {units.map((unit) => {
                            const sessions = Array.isArray(unit.sessions) ? unit.sessions : [];
                            const hasSessions = sessions.length > 0;
                            const defaultEnd = new Date(unit.endTime);
                            const firstSession = hasSessions ? sessions[0] : null;
                            const startTime = hasSessions
                                ? new Date(
                                      (firstSession?.endTime ?? unit.endTime) -
                                          (firstSession?.duration ?? 0) * 1000
                                  )
                                : defaultEnd;
                            const endTime = defaultEnd;
                            const isActive = unit.isActive === true;
                            const status = (() => {
                                if (isActive) {
                                    return unit.isPaused ? 'paused' : 'active';
                                }
                                if (unit.status === 'waiting') {
                                    return 'waiting';
                                }
                                return null;
                            })();
                            const isBottle =
                                typeof unit.type === 'string' &&
                                unit.type.toLowerCase() === 'bottle';
                            // Prefer ounces; convert legacy mL if needed
                            const ozField = Number(unit.volumeOz);
                            const mlLegacy = Number(unit.volumeMl ?? 0);
                            const volOz = Number.isFinite(ozField)
                                ? ozField
                                : Number.isFinite(mlLegacy)
                                  ? mlLegacy / 29.5735
                                  : 0;
                            const volumeDisplay = Math.round(volOz * 10) / 10;
                            const canDelete = !isActive;
                            const translationClass =
                                canDelete && openItemId === unit.id ? '-translate-x-56' : 'translate-x-0';
                            const swipeHandlers = canDelete
                                ? {
                                      onTouchStart: (event) => handleTouchStart(event, unit.id),
                                      onTouchEnd: (event) => handleTouchEnd(event, unit.id),
                                      onMouseDown: (event) => handleMouseDown(event, unit.id),
                                      onMouseUp: (event) => handleMouseUp(event, unit.id),
                                  }
                                : {};
                            const editingActive = isEditing(unit.id);

                            return (
                                <div key={unit.id} className="relative rounded-xl overflow-hidden">
                                    {canDelete && (
                                        <div
                                            className={`absolute inset-0 flex items-stretch justify-end gap-2 px-2 rounded-inherit transition-opacity duration-150 ${
                                                openItemId === unit.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0 pointer-events-none'
                                            }`}
                                            aria-hidden={openItemId !== unit.id}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(unit, isBottle)}
                                                className="w-28 bg-amber-200 text-amber-900 font-semibold flex items-center justify-center rounded-lg shadow-sm border border-amber-300"
                                                aria-label="Edit feeding entry"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(unit.id)}
                                                className="w-28 danger-glass text-white font-semibold flex items-center justify-center"
                                                aria-label="Delete feeding entry"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <div
                                        className={`border-l-4 ${
                                            isActive ? 'border-emerald-400' : 'border-violet-300'
                                        } pl-3 pr-6 pt-2 glass-soft glass--violet transition-transform duration-200 ease-out ${
                                            canDelete ? translationClass : 'translate-x-0'
                                        } ${
                                            isActive
                                                ? 'ring-1 ring-emerald-200 bg-emerald-50/70'
                                                : editingActive
                                                  ? 'ring-2 ring-amber-200 bg-amber-50/60'
                                                  : ''
                                        }`}
                                        {...swipeHandlers}
                                    >
                                        <div className="text-sm text-slate-600">
                                            {formatTime(startTime)} - {formatTime(endTime)}
                                        </div>
                                        {status && (
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full text-sm font-semibold ${
                                                    status === 'active'
                                                        ? 'bg-emerald-100/90 text-emerald-700'
                                                        : status === 'paused'
                                                          ? 'bg-amber-100/90 text-amber-800'
                                                          : 'bg-rose-100/90 text-rose-700'
                                                }`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${
                                                        status === 'active'
                                                            ? 'bg-emerald-500 animate-pulse'
                                                            : status === 'paused'
                                                              ? 'bg-amber-400'
                                                              : 'bg-rose-500'
                                                    }`}
                                                />
                                                {status === 'active' && 'Live feed in progress'}
                                                {status === 'paused' && 'Live feed is paused'}
                                                {status === 'waiting' && 'Waiting for user input'}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-2 pb-3">
                                            {isBottle ? (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 font-semibold text-sm">
                                                    <span>🍼 Bottle</span>
                                                    <span>•</span>
                                                    <span>{volumeDisplay} oz</span>
                                                </div>
                                            ) : (
                                                sessions.map((session, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                                            session.side === FeedingSide.Left
                                                                ? 'bg-violet-100/80 text-violet-700'
                                                                : 'bg-rose-100/80 text-rose-700'
                                                        } ${
                                                            editingActive ? 'wiggle animate-wiggle' : ''
                                                        } ${
                                                            editingActive
                                                                ? 'cursor-pointer ring-1 ring-amber-200'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            editingActive
                                                                ? handleBubbleSelect(unit, session.side)
                                                                : undefined
                                                        }
                                                    >
                                                        <span className="font-bold">
                                                            {session.side?.[0] ?? '?'}
                                                        </span>
                                                        <span className="text-sm">
                                                            <TimerDisplay
                                                                seconds={session.duration || 0}
                                                            />
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {isPickerOpen && editingUnit && (
                <WheelPicker
                    value={editValue ?? 0}
                    min={0}
                    max={20}
                    step={1}
                    label={pickerLabel || (editType === 'bottle' ? 'Edit bottle (oz)' : 'Edit side')}
                    onChange={(next) => setEditValue(next)}
                    onClose={handleCancel}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
