import { useState, useMemo } from 'react';
import dictionaryDataRaw from './data/dictionaryData.json';
import { DictionaryEntry } from './types';
import { Search, Book, ChevronRight, X, Library, Folder, Filter, ArrowLeft, LayoutGrid, List, Sparkles, Gamepad2, Clock } from 'lucide-react';
import { CATEGORY_GROUPS, SUPER_CATEGORIES_ORDER } from './lib/categories';
import DailyGame from './components/DailyGame';

const dictionaryData = dictionaryDataRaw as DictionaryEntry[];
const allCategories = Array.from(new Set(dictionaryData.map(e => e.category))).sort();

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  
  const [recentSearches, setRecentSearches] = useState<DictionaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('hiztegi_recent');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'terms' | 'categories'>('terms');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPlayingGame, setIsPlayingGame] = useState(false);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setIsPlayingGame(false);
    setRecentSearches(prev => {
      const filtered = prev.filter(e => e.id !== entry.id);
      const newList = [entry, ...filtered].slice(0, 3);
      localStorage.setItem('hiztegi_recent', JSON.stringify(newList));
      return newList;
    });
  };

  // Word of the Day calculation
  const wordOfTheDay = useMemo(() => {
    if (dictionaryData.length === 0) return null;
    const epoch = new Date("2024-01-01T00:00:00Z").getTime();
    const now = new Date().getTime();
    const daysSinceEpoch = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
    const index = Math.abs(daysSinceEpoch) % dictionaryData.length;
    return dictionaryData[index];
  }, []);

  // Filter terms by category first
  const categoryFilteredData = useMemo(() => {
    if (!selectedCategory) return dictionaryData;
    return dictionaryData.filter(entry => entry.category === selectedCategory);
  }, [selectedCategory]);

  // Then filter by search term, with performance limits
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return categoryFilteredData.slice(0, 100); 
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matches = [];
    
    for (let i = 0; i < categoryFilteredData.length; i++) {
      const entry = categoryFilteredData[i];
      const match = 
        entry.euskara.some(t => t.toLowerCase().includes(searchLower)) ||
        entry.espanol.some(t => t.toLowerCase().includes(searchLower)) ||
        (entry.french && entry.french.some(t => t.toLowerCase().includes(searchLower))) ||
        (entry.english && entry.english.some(t => t.toLowerCase().includes(searchLower)));
        
      if (match) {
        matches.push(entry);
        if (matches.length >= 200) break; // Limit to 200 matches for performance
      }
    }
    return matches;
  }, [searchTerm, categoryFilteredData]);

  // Filter categories for the category tab
  const categorySearchResults = useMemo(() => {
    if (!searchTerm.trim()) return allCategories;
    const searchLower = searchTerm.toLowerCase();
    return allCategories.filter(cat => cat.toLowerCase().includes(searchLower));
  }, [searchTerm]);

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setActiveTab('terms');
    setSearchTerm('');
    setSelectedEntry(null);
    setIsPlayingGame(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-200">
      
      {/* Sidebar */}
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
          
          {/* Active Category Filter Tag - Only show in terms view if a category is selected */}
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
                  onClick={() => { setIsPlayingGame(true); setSelectedEntry(null); }}
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

          {/* TERMS LIST (Search or Category filtering) */}
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
                    {/* Hide category pill if we are already filtering by it, keeps it cleaner */}
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
                // Filter these by search
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

              {/* Uncategorized (if any) */}
              {(() => {
                const categorizedSets = new Set(Object.values(CATEGORY_GROUPS).flat());
                const uncategorized = categorySearchResults.filter(cat => !categorizedSets.has(cat));
                
                if (uncategorized.length === 0) return null;
                
                return (
                  <div key="Beste batzuk" className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 mb-3 px-3 uppercase tracking-wider">
                      Beste batzuk
                    </h3>
                    <div className="flex flex-col gap-2">
                      {uncategorized.map((cat, idx) => {
                        const count = dictionaryData.filter(e => e.category === cat).length;
                        return (
                          <button
                            key={`uncat-${idx}`}
                            onClick={() => handleSelectCategory(cat)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
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
              })()}
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

      {/* Detail View Pane */}
      <div className={`flex-1 min-h-0 min-w-0 flex flex-col h-full bg-slate-50/50 ${!selectedEntry && !isPlayingGame ? 'hidden md:flex' : 'flex'}`}>
        
        {isPlayingGame ? (
          <DailyGame dictionaryData={dictionaryData} onClose={() => setIsPlayingGame(false)} />
        ) : selectedEntry ? (
          <div className="flex-1 overflow-y-auto w-full relative">
            <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center">
               <button 
                className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-colors"
                onClick={() => { setSelectedEntry(null); setIsPlayingGame(false); }}
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
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-[2rem] blur-xl"></div>
              <Library size={56} className="text-blue-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Hiztegi Bateratua</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg font-medium">
              Arakatu edo bilatu ezkerreko panelean. <br/>
              Guztira <b className="text-blue-600">{dictionaryData.length.toLocaleString()}</b> termino daude eskuragarri <b className="text-blue-600">{allCategories.length}</b> kategoriatan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

