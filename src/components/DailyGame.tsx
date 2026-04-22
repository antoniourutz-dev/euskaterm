import { useState, useMemo, useEffect } from 'react';
import { DictionaryEntry } from '../types';
import { Trophy, CheckCircle2, ArrowLeft } from 'lucide-react';

interface DailyGameProps {
  dictionaryData: DictionaryEntry[];
  onClose: () => void;
}

export default function DailyGame({ dictionaryData, onClose }: DailyGameProps) {
  const dailyGameData = useMemo(() => {
    // Determine start of current day universally (UTC)
    const now = new Date();
    const utcDayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
    const epoch = new Date("2024-01-01T00:00:00Z").getTime();
    const daysSinceEpoch = Math.floor((utcDayStart - epoch) / (1000 * 60 * 60 * 24));

    let seed = daysSinceEpoch * 1000;
    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Only pick entries that definitely have both Basque and Spanish single straightforward terms
    const validEntries = dictionaryData.filter(d => 
       d.euskara && d.euskara[0] && d.espanol && d.espanol[0] &&
       d.euskara[0].length < 40 && d.espanol[0].length < 40
    );
    
    if (validEntries.length === 0) return { euskaraList: [], espanolList: [] };

    // Group by category to ensure variety
    const byCategory: Record<string, DictionaryEntry[]> = {};
    for (const entry of validEntries) {
      if (!byCategory[entry.category]) byCategory[entry.category] = [];
      byCategory[entry.category].push(entry);
    }

    const categories = Object.keys(byCategory);
    // Shuffle categories
    categories.sort(() => seededRandom() - 0.5);

    const selected: DictionaryEntry[] = [];
    // Pick 1 random word from 10 different random categories (or loop through categories if not enough)
    for(let i = 0; i < 10; i++) {
        const cat = categories[i % categories.length];
        const entriesInCat = byCategory[cat];
        const chosenEntry = entriesInCat[Math.floor(seededRandom() * entriesInCat.length)];
        selected.push(chosenEntry);
    }

    // Shuffle Euskara and Spanish columns with independent sorting
    const euskaraList = [...selected].sort(() => seededRandom() - 0.5);
    const espanolList = [...selected].sort(() => seededRandom() - 0.5);

    return { euskaraList, espanolList };
  }, [dictionaryData]);

  const [selectedEu, setSelectedEu] = useState<string | null>(null);
  const [selectedEs, setSelectedEs] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [incorrectEu, setIncorrectEu] = useState<string | null>(null);
  const [incorrectEs, setIncorrectEs] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEu && selectedEs) {
      if (selectedEu === selectedEs) {
        // Matches!
        setMatchedPairs(prev => [...prev, selectedEu]);
        setSelectedEu(null);
        setSelectedEs(null);
      } else {
        // Incorrect
        setIncorrectEu(selectedEu);
        setIncorrectEs(selectedEs);
        setTimeout(() => {
          setIncorrectEu(null);
          setIncorrectEs(null);
          setSelectedEu(null);
          setSelectedEs(null);
        }, 800); // Wait for the visual shake to resolve
      }
    }
  }, [selectedEu, selectedEs]);

  const isComplete = dailyGameData.euskaraList.length > 0 && matchedPairs.length === dailyGameData.euskaraList.length;

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col h-full overflow-hidden bg-slate-50/50">
       {/* Mobile Sticky Header with Exit Button */}
       <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button 
             className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-colors"
             onClick={onClose}
          >
             <ArrowLeft size={18} /> Irten / Amaitu
          </button>
          <span className="font-bold text-slate-800 text-sm">Eguneko Erronka</span>
       </div>

       <div className="flex-1 overflow-y-auto min-h-0 flex flex-col pb-10">
           {/* Desktop Header */}
           <div className="hidden md:flex mb-8 mt-12 border-b border-slate-200 pb-6 text-center flex-shrink-0 flex-col items-center relative">
             <button 
                 onClick={onClose} 
                 className="absolute left-8 top-1 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium border border-transparent hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
             >
                <ArrowLeft size={20} /> Irten
             </button>
             <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-2">Eguneko Erronka</h2>
             <p className="text-base text-slate-500 font-medium px-4">Batu euskara eta gaztelaniazko pareak. Egunero ezberdina!</p>
           </div>
           
           {/* Mobile subheader purely for visual */}
           <div className="md:hidden mb-4 mt-2 px-4 text-center">
             <p className="text-xs text-slate-500 font-medium">Asmatu kategoria ezberdinetako 10 termino.</p>
           </div>
           
           {isComplete ? (
             <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 p-6 text-center">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
                   <Trophy size={48} className="md:w-[64px] md:h-[64px]" />
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-3 md:mb-4">Bikain!</h3>
                <p className="text-lg md:text-2xl text-slate-500 font-medium">Gaurko erronka osoa ebatzi duzu.</p>
                <p className="text-sm md:text-lg text-slate-400 mt-2 max-w-sm mx-auto">Bihartik aurrera hitz berriak egongo dira prest jolas honetan.</p>
             </div>
           ) : (
             <div className="px-2 lg:px-8 max-w-4xl mx-auto w-full">
               <div className="flex justify-between items-center mb-4 md:mb-6 px-1 md:px-4">
                 <span className="font-bold text-emerald-600 text-[10px] md:text-sm tracking-[0.2em] uppercase">Euskara</span>
                 <span className="font-bold text-orange-600 text-[10px] md:text-sm tracking-[0.2em] uppercase">Español</span>
               </div>
               
               <div className="flex flex-row justify-between gap-3 md:gap-12">
                  {/* Euskara Column */}
                  <div className="flex-1 flex flex-col gap-2.5 md:gap-3">
                    {dailyGameData.euskaraList.map(entry => {
                       const isMatched = matchedPairs.includes(entry.id);
                       const isSelected = selectedEu === entry.id;
                       const isIncorrect = incorrectEu === entry.id;
                       
                       let baseClass = "p-3 md:p-4 rounded-xl border-2 transition-all font-semibold text-xs md:text-[15px] leading-snug text-left min-h-[64px] md:min-h-[72px] flex items-center shadow-sm relative overflow-hidden w-full ";
                       if (isMatched) {
                         baseClass += "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-40";
                       } else if (isIncorrect) {
                         baseClass += "bg-red-50 border-red-400 text-red-700 animate-shake";
                       } else if (isSelected) {
                         baseClass += "bg-emerald-500 border-emerald-600 text-white shadow-md transform scale-[1.02] md:scale-105 z-10 ring-2 ring-emerald-300 ring-offset-1";
                       } else {
                         baseClass += "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50";
                       }

                       return (
                         <button 
                           key={`eu-${entry.id}`} 
                           onClick={() => !isMatched && !incorrectEu && setSelectedEu(entry.id)}
                           disabled={isMatched || incorrectEu !== null}
                           className={baseClass}
                         >
                            <span className="pr-5 md:pr-8">{entry.euskara[0]}</span>
                            {isMatched && <CheckCircle2 size={18} className="absolute right-2 md:right-4 text-emerald-500" />}
                         </button>
                       )
                    })}
                  </div>

                  {/* Español Column */}
                  <div className="flex-1 flex flex-col gap-2.5 md:gap-3">
                    {dailyGameData.espanolList.map(entry => {
                       const isMatched = matchedPairs.includes(entry.id);
                       const isSelected = selectedEs === entry.id;
                       const isIncorrect = incorrectEs === entry.id;
                       
                       let baseClass = "p-3 md:p-4 rounded-xl border-2 transition-all font-semibold text-xs md:text-[15px] leading-snug text-left min-h-[64px] md:min-h-[72px] flex items-center justify-end text-right shadow-sm relative overflow-hidden w-full ";
                       if (isMatched) {
                         baseClass += "bg-orange-50 border-orange-200 text-orange-700 opacity-40";
                       } else if (isIncorrect) {
                         baseClass += "bg-red-50 border-red-400 text-red-700 animate-shake";
                       } else if (isSelected) {
                         baseClass += "bg-orange-500 border-orange-600 text-white shadow-md transform scale-[1.02] md:scale-105 z-10 ring-2 ring-orange-300 ring-offset-1";
                       } else {
                         baseClass += "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50";
                       }

                       return (
                         <button 
                           key={`es-${entry.id}`} 
                           onClick={() => !isMatched && !incorrectEs && setSelectedEs(entry.id)}
                           disabled={isMatched || incorrectEs !== null}
                           className={baseClass}
                         >
                            {isMatched && <CheckCircle2 size={18} className="absolute left-2 md:left-4 text-orange-500" />}
                            <span className="pl-5 md:pl-8">{entry.espanol[0]}</span>
                         </button>
                       )
                    })}
                  </div>
               </div>
             </div>
           )}
       </div>
    </div>
  )
}
