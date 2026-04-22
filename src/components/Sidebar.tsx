import React from 'react';
import { Search, ChevronRight, Library, LayoutGrid, List, Sparkles, Gamepad2, Clock, Filter, X, Folder } from 'lucide-react';
import { DictionaryEntry } from '../types';
import { CATEGORY_GROUPS, SUPER_CATEGORIES_ORDER } from '../lib/categories';

interface SidebarProps {
  activeTab: 'terms' | 'categories';
  setActiveTab: (tab: 'terms' | 'categories') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  handleSelectCategory: (category: string | null) => void;
  searchResults: DictionaryEntry[];
  categorySearchResults: string[];
  recentSearches: DictionaryEntry[];
  wordOfTheDay: DictionaryEntry | null;
  selectedEntry: DictionaryEntry | null;
  handleSelectEntry: (entry: DictionaryEntry) => void;
  isPlayingGame: boolean;
  setIsPlayingGame: (playing: boolean) => void;
  dictionaryData: DictionaryEntry[];
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  handleSelectCategory,
  searchResults,
  categorySearchResults,
  recentSearches,
  wordOfTheDay,
  selectedEntry,
  handleSelectEntry,
  isPlayingGame,
  setIsPlayingGame,
  dictionaryData
}: SidebarProps) {
  return (
    <div 
      className={`w-full h-full min-h-0 md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-slate-200 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 
      ${selectedEntry || isPlayingGame ? 'hidden md:flex' : 'flex'}`}
    >
      {/* Header & Controls */}
      <header className="pt-6 px-6 pb-4 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-sm">
            <Library size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Hiztegi Bateratua
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl mb-5 border border-slate-200/60 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'terms' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={16} /> Terminoak
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={16} /> Kategoriak
          </button>
        </div>
        
        {/* Active Category Filter Tag */}
        {activeTab === 'terms' && selectedCategory && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-2 rounded-lg mb-4 font-medium">
            <div className="flex items-center gap-2 truncate">
              <Filter size={14} className="shrink-0" />
              <span className="truncate">{selectedCategory}</span>
            </div>
            <button 
              onClick={() => handleSelectCategory(null)}
              className="hover:bg-blue-100 p-1 rounded-full text-blue-500 transition-colors shrink-0 ml-2"
              title="Garbitu kategoria"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          <input 
            type="text"
            placeholder={activeTab === 'terms' ? "Bilatu terminoa..." : "Bilatu kategoria..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results meta info */}
        <div className="mt-4 text-[11px] uppercase tracking-wider text-slate-400 font-bold flex justify-between">
           {activeTab === 'terms' ? (
              <>
                <span>
                  {searchTerm ? 'Iradokizunak' : (selectedCategory ? 'Kategoriako terminoak' : 'Azken terminoak')}
                </span>
                <span>{searchTerm || selectedCategory ? searchResults.length + (searchResults.length === 200 ? '+' : '') : (recentSearches.length > 0 ? recentSearches.length : '')}</span>
              </>
           ) : (
              <>
                <span>Bildumak</span>
                <span>{categorySearchResults.length}</span>
              </>
           )}
        </div>
      </header>

      {/* Content List Flow */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/50">
        
        {/* DEFAULT HOME VIEW: No search term and no category selected */}
        {activeTab === 'terms' && !searchTerm && !selectedCategory && (
          <div className="flex flex-col gap-6 w-full px-1">
            {/* Eguneko Hitza */}
            {wordOfTheDay && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  Eguneko Hitza
                </h3>
                <button
                  onClick={() => handleSelectEntry(wordOfTheDay)}
                  className="w-full text-left p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-[#b21c43] text-white shadow-md hover:shadow-lg transition-all border border-transparent group relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Sparkles size={100} />
                  </div>
                  <div className="relative z-10 flex gap-4 items-center">
                    <div className="min-w-0 flex-1">
                      <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Folder size={12} />
                        <span className="truncate">{wordOfTheDay.category}</span>
                      </div>
                      <h4 className="text-2xl font-bold mb-1 truncate drop-shadow-sm">
                        {wordOfTheDay.euskara[0]}
                      </h4>
                      <p className="text-white/90 font-medium truncate">
                        {wordOfTheDay.espanol[0]}
                      </p>
                    </div>
                    <ChevronRight size={24} className="text-white/50 shrink-0 group-hover:text-white transition-colors" />
                  </div>
                </button>
              </div>
            )}
            
            {/* Jelasa (Game) Button */}
            <div>
              <button
                onClick={() => { setIsPlayingGame(true); }}
                className={`w-full py-4 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden ${isPlayingGame ? 'ring-4 ring-blue-500/30' : ''}`}
              >
                <Gamepad2 size={24} />
                <span className="text-lg tracking-wide shadow-sm">10 Hitzen Erronka</span>
              </button>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  Azken bilaketak
                </h3>
                <div className="flex flex-col gap-1">
                  {recentSearches.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectEntry(entry)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 border ${
                        selectedEntry?.id === entry.id
                          ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                          : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold truncate ${selectedEntry?.id === entry.id ? 'text-blue-700' : 'text-slate-800'}`}>
                            {entry.euskara[0]}
                          </h3>
                          <div className="mt-1 flex flex-col gap-1.5">
                            <span className="text-sm truncate text-slate-500 max-w-full">
                              {entry.espanol[0]}
                            </span>
                            <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 truncate max-w-full">
                              {entry.category}
                            </span>
                          </div>
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={`mt-1 shrink-0 ${selectedEntry?.id === entry.id ? 'text-blue-500' : 'text-slate-300'}`} 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TERMS LIST */}
        {activeTab === 'terms' && (searchTerm || selectedCategory) && searchResults.map((entry) => (
          <button
            key={entry.id}
            onClick={() => handleSelectEntry(entry)}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 border ${
              selectedEntry?.id === entry.id
                ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold truncate ${selectedEntry?.id === entry.id ? 'text-blue-700' : 'text-slate-800'}`}>
                  {entry.euskara[0]}
                </h3>
                <div className="mt-1 flex flex-col gap-1.5">
                  <span className="text-sm truncate text-slate-500 max-w-full">
                    {entry.espanol[0]}
                  </span>
                  {!selectedCategory && (
                    <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 truncate max-w-full">
                      {entry.category}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className={`mt-1 shrink-0 ${selectedEntry?.id === entry.id ? 'text-blue-500' : 'text-slate-300'}`} 
              />
            </div>
          </button>
        ))}

        {/* CATEGORIES LIST */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6 px-1">
            {SUPER_CATEGORIES_ORDER.map(superCat => {
              const catsInSuperCat = CATEGORY_GROUPS[superCat] || [];
              const visibleCats = catsInSuperCat.filter(cat => categorySearchResults.includes(cat));
              
              if (visibleCats.length === 0) return null;

              return (
                <div key={superCat} className="flex flex-col">
                  <h3 className="text-sm font-bold text-[#b21c43] mb-3 px-3 uppercase tracking-wider">
                    {superCat}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {visibleCats.map((cat, idx) => {
                      const count = dictionaryData.filter(e => e.category === cat).length;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectCategory(cat)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
                              <Folder size={18} />
                            </div>
                            <span className="font-semibold text-slate-700 truncate">{cat}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pl-3">
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{count}</span>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Empty States */}
        {activeTab === 'terms' && (searchTerm || selectedCategory) && searchResults.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Search className="text-slate-300" size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">Ez da terminoak aurkitu "{searchTerm}" bilaketarako.</p>
          </div>
        )}

        {activeTab === 'categories' && categorySearchResults.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Folder className="text-slate-300" size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">Ez da kategoria aurkitu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
