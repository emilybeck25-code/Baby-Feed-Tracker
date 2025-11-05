export function PlayIcon({ className = 'w-10 h-10', ...props }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polygon points="8 5 19 12 8 19 8 5" />
        </svg>
    );
}
