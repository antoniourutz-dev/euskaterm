import React from 'react';
import { Library } from 'lucide-react';

interface EmptyStateProps {
  dictionaryCount: number;
  categoryCount: number;
}

export default function EmptyState({ dictionaryCount, categoryCount }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 relative">
        <div className="absolute inset-0 bg-blue-500/10 rounded-[2rem] blur-xl"></div>
        <Library size={56} className="text-blue-500 relative z-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Hiztegi Bateratua</h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg font-medium">
        Arakatu edo bilatu ezkerreko panelean. <br/>
        Guztira <b className="text-blue-600">{dictionaryCount.toLocaleString()}</b> termino daude eskuragarri <b className="text-blue-600">{categoryCount}</b> kategoriatan.
      </p>
    </div>
  );
}
