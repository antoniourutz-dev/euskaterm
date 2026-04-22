import { useState, useMemo, useEffect } from 'react';
import { DictionaryEntry } from './types';
import Sidebar from './components/Sidebar';
import TermDetail from './components/TermDetail';
import DailyGame from './components/DailyGame';
import EmptyState from './components/EmptyState';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  
  const [recentSearches, setRecentSearches] = useState<DictionaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('hiztegi_recent');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeTab, setActiveTab] = useState<'terms' | 'categories'>('terms');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPlayingGame, setIsPlayingGame] = useState(false);

  useEffect(() => {
    fetch('/data/dictionaryData.json')
      .then(res => res.json())
      .then(data => {
        setDictionaryData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading dictionary:', err);
        setIsLoading(false);
      });
  }, []);

  const allCategories = useMemo(() => {
    return Array.from(new Set(dictionaryData.map(e => e.category))).sort();
  }, [dictionaryData]);

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

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setActiveTab('terms');
    setSearchTerm('');
    setSelectedEntry(null);
    setIsPlayingGame(false);
  };

  const wordOfTheDay = useMemo(() => {
    if (dictionaryData.length === 0) return null;
    const epoch = new Date("2024-01-01T00:00:00Z").getTime();
    const now = new Date().getTime();
    const daysSinceEpoch = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
    const index = Math.abs(daysSinceEpoch) % dictionaryData.length;
    return dictionaryData[index];
  }, [dictionaryData]);

  const categoryFilteredData = useMemo(() => {
    if (!selectedCategory) return dictionaryData;
    return dictionaryData.filter(entry => entry.category === selectedCategory);
  }, [selectedCategory, dictionaryData]);

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
        if (matches.length >= 200) break;
      }
    }
    return matches;
  }, [searchTerm, categoryFilteredData]);

  const categorySearchResults = useMemo(() => {
    if (!searchTerm.trim()) return allCategories;
    const searchLower = searchTerm.toLowerCase();
    return allCategories.filter(cat => cat.toLowerCase().includes(searchLower));
  }, [searchTerm, allCategories]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-500 font-medium animate-pulse text-lg">Datuak kargatzen...</p>
      </div>
    );
  }

  return (

    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-200">
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        handleSelectCategory={handleSelectCategory}
        searchResults={searchResults}
        categorySearchResults={categorySearchResults}
        recentSearches={recentSearches}
        wordOfTheDay={wordOfTheDay}
        selectedEntry={selectedEntry}
        handleSelectEntry={handleSelectEntry}
        isPlayingGame={isPlayingGame}
        setIsPlayingGame={setIsPlayingGame}
        dictionaryData={dictionaryData}
      />

      <div className={`flex-1 min-h-0 min-w-0 flex flex-col h-full bg-slate-50/50 ${!selectedEntry && !isPlayingGame ? 'hidden md:flex' : 'flex'}`}>
        {isPlayingGame ? (
          <DailyGame dictionaryData={dictionaryData} onClose={() => setIsPlayingGame(false)} />
        ) : selectedEntry ? (
          <TermDetail 
            selectedEntry={selectedEntry} 
            setSelectedEntry={setSelectedEntry}
            handleSelectCategory={handleSelectCategory}
          />
        ) : (
          <EmptyState 
            dictionaryCount={dictionaryData.length} 
            categoryCount={allCategories.length} 
          />
        )}
      </div>
    </div>
  );
}
