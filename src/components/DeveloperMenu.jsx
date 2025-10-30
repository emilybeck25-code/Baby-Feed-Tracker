import { useState, useRef, useEffect } from 'react';
import { MenuIcon } from './icons';

export function DeveloperMenu({ onImportData }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

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
        onImportData();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Developer menu"
            >
                <MenuIcon className="w-6 h-6 text-slate-600" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <button
                        onClick={handleImport}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        📊 Import Sample Data
                    </button>
                </div>
            )}
        </div>
    );
}
