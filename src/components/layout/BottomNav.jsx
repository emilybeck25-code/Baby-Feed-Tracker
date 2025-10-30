import { ClockIcon } from '../icons/ClockIcon';
import { ChartIcon } from '../icons/ChartIcon';
import { BellIcon } from '../icons/BellIcon';

export function BottomNav({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'Tracker', label: 'Tracker', Icon: ClockIcon },
        { id: 'Summary', label: 'Summary', Icon: ChartIcon },
        { id: 'Notify', label: 'Notify', Icon: BellIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center py-2">
                {navItems.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => onNavigate(id)}
                        className={`flex flex-col items-center p-2 ${currentPage === id ? 'text-violet-500' : 'text-slate-500'}`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs mt-1">{label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
