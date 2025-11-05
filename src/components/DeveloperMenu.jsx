import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../theme/useTheme';
import { MenuIcon } from './icons/MenuIcon';

export function DeveloperMenu({ onImportData, onClearHistory, clearDisabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const { theme, setTheme } = useTheme();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleImport = () => {
        onImportData?.();
        setIsOpen(false);
    };

    const handleClear = () => {
        if (clearDisabled) return;
        onClearHistory?.();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Developer menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <MenuIcon className="w-6 h-6 text-slate-600" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    role="menu"
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                >
                    <button
                        onClick={handleImport}
                        role="menuitem"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        📊 Import Sample Data
                    </button>

                    <div className="my-1 border-t border-slate-200" />

                    <button
                        onClick={handleClear}
                        role="menuitem"
                        disabled={clearDisabled}
                        aria-disabled={clearDisabled}
                        className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        🧹 Clear All History
                    </button>

                    <div className="my-1 border-t border-slate-200" />
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500">Theme</div>
                    <div className="px-2 pb-2 flex gap-2">
                        {THEMES.map((t) => (
                            <button
                                key={t}
                                disabled={clearDisabled}
                                onClick={() => setTheme(t)}
                                className={`flex-1 px-2 py-1 rounded-md text-sm ${
                                    theme === t
                                        ? 'gradient-chip text-slate-800'
                                        : 'glass-soft text-slate-700'
                                }`}
                                aria-pressed={theme === t}
                                type="button"
                            >
                                {t[0].toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
