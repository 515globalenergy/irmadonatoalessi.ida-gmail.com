import React from 'react';
import {
  Compass,
  Award,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { CommunityMember } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';

interface TavolinoStatsProps {
  members: CommunityMember[];
  onFilterByCategory: (categoryId: string) => void;
  onFilterByNew: () => void;
  coverUrl?: string;
  onOpenCoverModal?: () => void;
}

export const TavolinoStats: React.FC<TavolinoStatsProps> = ({
  members,
  onFilterByCategory,
  onFilterByNew,
  coverUrl = '/src/assets/images/tavolino_irma_notebook_1792338345686.jpg',
  onOpenCoverModal,
}) => {
  const total = members.length;
  const newCount = members.filter((m) => m.isNuovo).length;
  const verifiedCount = members.filter((m) => m.stato === 'attivo').length;

  // Region grouping
  const regionCounts = members.reduce((acc, m) => {
    acc[m.regione] = (acc[m.regione] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Hero Presentation Card */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white border border-stone-800 shadow-lg">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={coverUrl}
            alt="Quaderno Agenda Tavolino delle Competenze Italia"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/75 to-transparent" />
        </div>
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Presidio Nazionale delle Competenze e dei Mestieri</span>
              </div>

              {onOpenCoverModal && (
                <button
                  onClick={onOpenCoverModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-white text-xs font-medium border border-stone-600 transition-colors shadow-xs cursor-pointer"
                >
                  <span>📷 Modifica Immagine</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tavolino delle Competenze · Creato da Irma Donato Alessi
            </h2>
            <div className="text-xs font-semibold text-amber-300 mt-1 uppercase tracking-wider">
              Community creata e guidata da Irma Donato Alessi
            </div>
            <p className="mt-2 text-stone-200 text-sm sm:text-base leading-relaxed font-serif-italian">
              Una rete coordinata di maestri artigiani, ingegneri, programmatori, medici, formatori e custodi del territorio italiano, ideata e fondata da <strong>Irma Donato Alessi</strong>. Il tavolo favorisce la trasmissione delle abilità operative, il riconoscimento formale delle qualifiche e lo sviluppo dell’eccellenza manifatturiera e tecnologica, con un sistema di vendite etiche e provvigioni condivise.
            </p>
          </div>

          {/* Founder Official Registry Badge */}
          <div className="mt-5 p-3.5 rounded-xl bg-stone-950/70 border border-amber-400/40 text-xs space-y-1.5 backdrop-blur-xs">
            <div className="text-2xs uppercase tracking-wider font-bold text-amber-400 flex items-center justify-between">
              <span>Referente & Fondatrice Ufficiale</span>
              <span className="text-stone-300 font-mono">CF: DNTRMI69H45F158I</span>
            </div>
            <div className="text-white font-bold text-sm">
              Irma Donato Alessi · Nata il 05/06/1969 a Messina (ME), Sicilia
            </div>
            <div className="flex flex-wrap items-center gap-4 text-2xs text-stone-300">
              <span>📍 Residenza: Messina, Sicilia</span>
              <span>📞 Cellulare: +39 377 9953174</span>
              <span>✉️ IRMADONATOALESSI.IDA@gmail.com</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Standard Nazionale EQF</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Botteghe & Professioni Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Community Permanente</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Totale Iscritti Tavolino
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {total}
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Professionisti censiti in anagrafe
          </div>
        </div>

        <div
          onClick={onFilterByNew}
          className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-300/80 dark:border-amber-900/60 shadow-xs cursor-pointer hover:border-amber-500 transition-colors"
        >
          <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Nuovi Inseriti Community</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-100 mt-1 tabular-nums">
            {newCount}
          </div>
          <div className="text-2xs text-amber-700 dark:text-amber-400 mt-1">
            Clicca per visualizzare l'elenco
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Stato Attivo nel Tavolo
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {verifiedCount}
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Membri plenari operativi
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Regioni Italiane Coperte
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 mt-1 tabular-nums">
            {Object.keys(regionCounts).length}
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Presidi territoriali attivi
          </div>
        </div>
      </div>

      {/* Categories Breakdown Matrix */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Ripartizione per Settori di Competenza Predefiniti
            </h3>
            <p className="text-xs text-stone-500">
              Distribuzione quantitativa dei profili iscritti nelle categorie ufficiali
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CATEGORIE_PREDEFINITE.map((cat) => {
            const count = members.filter((m) => m.categoriaId === cat.id).length;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div
                key={cat.id}
                onClick={() => onFilterByCategory(cat.id)}
                className="p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-amber-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                    {cat.nome}
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                    {count}
                  </span>
                </div>

                <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-2xs text-stone-500 mt-1.5">
                  <span className="truncate max-w-[170px]">{cat.descrizione}</span>
                  <span className="font-mono">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Distribution Map/List */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>Presenza Territoriale nelle Regioni Italiane</span>
          </h3>
          <p className="text-xs text-stone-500">
            Copertura geografica dei referenti del Tavolino delle Competenze
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedRegions.map(([regione, count]) => (
            <div
              key={regione}
              className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2"
            >
              <span>{regione}</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-stone-900 dark:text-amber-100 text-2xs font-mono font-bold tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
