export function StopIcon({ className = 'w-10 h-10', ...props }) {
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
            <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
    );
}
