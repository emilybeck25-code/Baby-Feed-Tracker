import { useMemo } from 'react';
import { useFeedingContext } from '../../contexts/FeedingContext';
import { FeedType } from '../../utils/constants';

const VARIANT_CLASSNAMES = {
    compact: 'min-w-[10rem] max-w-[14rem]',
    wide: 'w-full',
};

const VARIANT_PADDING = {
    compact: 'p-1',
    wide: 'p-1.5 sm:p-2',
};

const VARIANT_TEXT = {
    compact: 'text-sm',
    wide: 'text-base sm:text-lg',
};

export function FeedTypeToggle({ variant = 'compact' }) {
    const { feedType, setFeedType, activeSide } = useFeedingContext();
    const disabled = activeSide !== null;

    const containerClasses = useMemo(() => {
        const sizeClass = VARIANT_CLASSNAMES[variant] ?? VARIANT_CLASSNAMES.compact;
        const paddingClass = VARIANT_PADDING[variant] ?? VARIANT_PADDING.compact;
        return `${sizeClass} ${paddingClass}`;
    }, [variant]);

    const textClass = VARIANT_TEXT[variant] ?? VARIANT_TEXT.compact;

    const handleSelect = (type) => {
        if (disabled || feedType === type) return;
        setFeedType(type);
    };

    const renderButton = (type, label) => {
        const isActive = feedType === type;
        return (
            <button
                key={type}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={disabled}
                onClick={() => handleSelect(type)}
                className={`flex-1 rounded-xl font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400 ${
                    isActive
                        ? 'bg-gradient-to-r from-rose-300 to-violet-300 text-slate-800 shadow-md'
                        : 'bg-transparent text-slate-600 hover:bg-white/60'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${textClass} py-2 sm:py-3`}
            >
                {label}
            </button>
        );
    };

    return (
        <div
            role="tablist"
            aria-label="Feed type"
            className={`flex items-center gap-1 rounded-2xl glass-soft ${containerClasses}`}
        >
            {renderButton(FeedType.Breast, '🤱')}
            {renderButton(FeedType.Bottle, '🍼')}
        </div>
    );
}
