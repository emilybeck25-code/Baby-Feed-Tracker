export function MenuIcon({ className = 'w-6 h-6', ...props }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    );
}
