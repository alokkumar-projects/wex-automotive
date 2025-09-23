import React from 'react';

export default function EmptyState({ message }) {
    return (
        <div className="text-center py-10">
            <p className="text-slate-600">{message}</p>
        </div>
    );
}