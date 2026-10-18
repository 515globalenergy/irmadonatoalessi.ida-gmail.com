import React from 'react';
import { BookOpen, Calendar, Database, Cloud, UserPlus, CheckCircle2, RefreshCw, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentTab: 'foglio' | 'agenda' | 'quadro' | 'vetrina';
  setCurrentTab: (tab: 'foglio' | 'agenda' | 'quadro' | 'vetrina') => void;
  onOpenNewMemberModal: () => void;
  onOpenCloudModal: () => void;
  onOpenCoverModal?: () => void;
  syncStatus: 'synced' | 'saving' | 'offline';
  lastSyncTime: string;
  newMembersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewMemberModal,
  onOpenCloudModal,
  onOpenCoverModal,
  syncStatus,
  lastSyncTime,
  newMembersCount,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'adesso';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top micro-strip for tricolor accent */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-emerald-600"></div>
        <div className="w-1/3 bg-stone-200"></div>
        <div className="w-1/3 bg-rose-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand & Wordmark with Founder Attribution */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400/40 bg-stone-800 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src="/src/assets/images/competenze_italia_emblem_1792337666125.jpg"
                alt="Emblema Tavolino delle Competenze Italia"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Tavolino delle Competenze
              </span>
              <span className="text-2xs sm:text-xs text-amber-400 font-sans -mt-0.5">
                Creato da Irma Donato Alessi · Community Ufficiale
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('foglio')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'foglio'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Foglio Mastro</span>
            </button>

            <button
              onClick={() => setCurrentTab('vetrina')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'vetrina'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Vetrina & Vendite (% Irma)</span>
            </button>

            <button
              onClick={() => setCurrentTab('agenda')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'agenda'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda Note</span>
            </button>

            <button
              onClick={() => setCurrentTab('quadro')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'quadro'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Quadro Competenze</span>
            </button>
          </nav>

          {/* Zone 3: Actions & "Pulsante in alto a destra nuovi inseriti nella community" */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Modifica Immagine Copertina button */}
            {onOpenCoverModal && (
              <button
                onClick={onOpenCoverModal}
                title="Modifica immagine di copertina dell'agenda"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors"
              >
                <span>📷 Copertina</span>
              </button>
            )}

            {/* Cloud Auto-Backup status button */}
            <button
              onClick={onOpenCloudModal}
              title={`Backup automatico su cloud attivo. Ultimo salvataggio: ${formatTime(lastSyncTime)}`}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              {syncStatus === 'saving' ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="tabular-nums">
                {syncStatus === 'saving' ? 'Salvataggio Cloud...' : `Cloud OK · ${formatTime(lastSyncTime)}`}
              </span>
            </button>

            {/* MANDATORY PRIMARY BUTTON: Nuovi Inseriti nella Community */}
            <button
              onClick={onOpenNewMemberModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>Nuovo Inserito nella Community</span>
              {newMembersCount > 0 && (
                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 bg-stone-900 text-amber-300 text-xs rounded font-bold">
                  +{newMembersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setCurrentTab('foglio')}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === 'foglio' ? 'bg-amber-600 text-white' : 'text-stone-300'
            }`}
          >
            Foglio
          </button>
          <button
            onClick={() => setCurrentTab('vetrina')}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === 'vetrina' ? 'bg-amber-600 text-white' : 'text-amber-400'
            }`}
          >
            Vetrina %
          </button>
          <button
            onClick={() => setCurrentTab('agenda')}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === 'agenda' ? 'bg-amber-600 text-white' : 'text-stone-300'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setCurrentTab('quadro')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentTab === 'quadro' ? 'bg-amber-600 text-white' : 'text-stone-300'
            }`}
          >
            Competenze
          </button>
          <button
            onClick={onOpenCloudModal}
            className="px-2 py-1 text-emerald-400 font-medium flex items-center gap-1"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud</span>
          </button>
        </div>
      </div>
    </header>
  );
};
