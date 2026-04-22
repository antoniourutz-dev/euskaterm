import React from 'react';
import { DictionaryEntry } from '../types';
import { ArrowLeft, Folder, Book } from 'lucide-react';

interface TermDetailProps {
  selectedEntry: DictionaryEntry;
  setSelectedEntry: (entry: DictionaryEntry | null) => void;
  handleSelectCategory: (category: string | null) => void;
}

export default function TermDetail({ selectedEntry, setSelectedEntry, handleSelectCategory }: TermDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center">
         <button 
          className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-colors"
          onClick={() => { setSelectedEntry(null); }}
        >
          <ArrowLeft size={18} /> Atzera
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-16">
        
        {/* Category Breadcrumb */}
        <div className="mb-6 flex gap-2 flex-wrap items-center">
          <button 
            onClick={() => handleSelectCategory(selectedEntry.category)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors shadow-sm"
          >
            <Folder size={12} /> {selectedEntry.category}
          </button>
          {selectedEntry.subcategory && selectedEntry.subcategory !== 'Orokorra' && (
            <>
              <span className="text-slate-300">/</span>
              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {selectedEntry.subcategory}
              </span>
            </>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-10">
          {selectedEntry.euskara[0]}
        </h1>

        {selectedEntry.definition && (
          <div className="mb-12 bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Book size={16} /> Definizioa
            </h4>
            <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
              {selectedEntry.definition}
            </p>
          </div>
        )}

        {/* Language Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Euskara */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">EU</span>
              <h4 className="font-bold text-slate-800 tracking-wide">Euskara</h4>
            </div>
            <ul className="space-y-3">
              {selectedEntry.euskara.map((term, i) => (
                <li key={i} className={`text-lg ${i === 0 ? 'font-bold text-slate-900' : 'text-slate-500 font-medium'}`}>
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Spanish */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">ES</span>
              <h4 className="font-bold text-slate-800 tracking-wide">Español</h4>
            </div>
            <ul className="space-y-3">
              {selectedEntry.espanol.map((term, i) => (
                <li key={i} className="text-lg font-semibold text-slate-700">
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* French */}
          {selectedEntry.french && selectedEntry.french.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">FR</span>
                <h4 className="font-bold text-slate-800 tracking-wide">Français</h4>
              </div>
              <ul className="space-y-3">
                {selectedEntry.french.map((term, i) => (
                  <li key={i} className="text-lg font-semibold text-slate-700">
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* English */}
          {selectedEntry.english && selectedEntry.english.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">EN</span>
                <h4 className="font-bold text-slate-800 tracking-wide">English</h4>
              </div>
              <ul className="space-y-3">
                {selectedEntry.english.map((term, i) => (
                  <li key={i} className="text-lg font-semibold text-slate-700">
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
