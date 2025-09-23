import React from 'react';

export default function VehicleCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-12 bg-slate-200 rounded"></div>
        <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}