import { useState } from 'react';
import { useFeedingContext } from '../../contexts/FeedingContext';

export function BottleControls() {
    const { addBottleFeed } = useFeedingContext();
    const [ounces, setOunces] = useState('');

    const parsed = Number(ounces);
    const isValid = Number.isFinite(parsed) && parsed > 0 && ounces !== '';

    const onSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;
        addBottleFeed(parsed); // store as ounces
        setOunces('');
    };

    return (
        <form
            onSubmit={onSubmit}
            className="w-full flex items-center justify-center gap-4"
            aria-label="Log bottle feeding in ounces"
        >
            <div className="flex items-end gap-2">
                <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={ounces}
                    onChange={(e) => setOunces(e.target.value)}
                    aria-label="Bottle amount in ounces"
                    placeholder="4"
                    className="w-28 text-center text-4xl font-bold text-slate-800 p-2 border-b-2 border-slate-300 focus:border-violet-500 outline-none"
                />
                <span className="pb-2 text-xl text-slate-600">oz</span>
            </div>
            <button
                type="submit"
                disabled={!isValid}
                className="flex-1 max-w-[14rem] py-4 px-6 bg-violet-500 text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
                Log Bottle
            </button>
        </form>
    );
}
