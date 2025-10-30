export function PlayIcon({ className = 'w-10 h-10', ...props }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M8 5v14l11-7-11-7z" />
        </svg>
    );
}
