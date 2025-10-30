export function StopIcon({ className = 'w-10 h-10', ...props }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
            <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
    );
}
