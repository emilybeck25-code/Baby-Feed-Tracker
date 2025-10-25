import React from 'react';

export function StatCard({ title, value }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-xs uppercase text-slate-500 font-semibold mb-2">{title}</div>
            <div className="text-3xl font-bold text-slate-800">{value}</div>
        </div>
    );
}
