export function StatCard({ title, value }) {
    return (
        <div className="glass p-5 rounded-2xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                {title}
            </div>
            <div className="text-3xl font-bold text-slate-800">{value}</div>
        </div>
    );
}
