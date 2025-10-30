import { FeedingSide } from '../../utils/constants';
import { StopIcon, PauseIcon, PlayIcon } from '../icons';

export function FeedButton({
    side,
    activeSide,
    paused,
    completedSession,
    suggestedStartSide,
    onClick,
}) {
    const isActive = activeSide === side;
    const isOtherSideActive = activeSide !== null && activeSide !== side;
    const isCompleted = completedSession?.side === side;

    const isLeftSide = side === FeedingSide.Left;
    const baseColor = isLeftSide ? 'violet' : 'rose';

    // Determine button styling
    const bgColor = isActive || isCompleted ? `bg-${baseColor}-600` : `bg-${baseColor}-400`;
    const scaleClass = suggestedStartSide === side ? 'scale-110' : '';
    const textSize =
        isCompleted ? 'text-lg' : activeSide !== null && !isActive ? '' : 'text-4xl';

    // Determine aria label
    let ariaLabel;
    if (isActive) {
        ariaLabel = `Stop ${side} side`;
    } else if (isOtherSideActive) {
        ariaLabel = paused ? 'Resume timer' : 'Pause timer';
    } else {
        ariaLabel = `Start ${side} side`;
    }

    // Determine button content
    const renderContent = () => {
        if (isActive) {
            return <StopIcon className="w-10 h-10 mx-auto" />;
        }
        if (isOtherSideActive) {
            return paused ? (
                <PlayIcon className="w-10 h-10 mx-auto" />
            ) : (
                <PauseIcon className="w-10 h-10 mx-auto" />
            );
        }
        if (isCompleted) {
            return 'Finish';
        }
        return side[0]; // 'L' or 'R'
    };

    return (
        <button
            onClick={onClick}
            className={`w-24 h-24 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform ${bgColor} ${textSize} ${scaleClass}`}
            aria-label={ariaLabel}
        >
            {renderContent()}
        </button>
    );
}
