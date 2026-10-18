import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  FileDown,
  Clock,
  Tag,
  PenTool,
  Bookmark,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AgendaNote, CategoryId, CommunityMember } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';

interface AgendaPlannerProps {
  notes: AgendaNote[];
  onAddNote: (note: AgendaNote) => void;
  onToggleComplete: (id: string) => void;
  onDeleteNote: (id: string) => void;
  members: CommunityMember[];
}

export const AgendaPlanner: React.FC<AgendaPlannerProps> = ({
  notes,
  onAddNote,
  onToggleComplete,
  onDeleteNote,
  members,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [contenuto, setContenuto] = useState('');
  const [categoriaRif, setCategoriaRif] = useState<CategoryId>('istruzione');
  const [priorita, setPriorita] = useState<'normale' | 'alta' | 'urgente'>('normale');
  const [obiettiviInput, setObiettiviInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !contenuto.trim()) return;

    const obiettiviList = obiettiviInput
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const newNote: AgendaNote = {
      id: `note-${Date.now()}`,
      titolo: titolo.trim(),
      data,
      contenuto: contenuto.trim(),
      categoriaRif,
      priorita,
      completata: false,
      obiettiviTavolino: obiettiviList.length > 0 ? obiettiviList : undefined,
    };

    onAddNote(newNote);
    setTitolo('');
    setContenuto('');
    setObiettiviInput('');
    setShowAddForm(false);
  };

  const downloadAgendaNotesTxt = () => {
    let text = `TAVOLINO DELLE COMPETENZE ITALIA - QUADERNO DI LAVORO & AGENDA\n`;
    text += `Estratto generato il: ${new Date().toLocaleDateString('it-IT')}\n`;
    text += `===============================================================\n\n`;

    notes.forEach((note, idx) => {
      text += `[${idx + 1}] DATA: ${note.data} | PRIORITÀ: ${note.priorita.toUpperCase()} | STATO: ${
        note.completata ? 'COMPLETATA' : 'APERTA'
      }\n`;
      text += `TITOLO: ${note.titolo}\n`;
      text += `SETTORE DI RIFERIMENTO: ${note.categoriaRif || 'Generale'}\n`;
      text += `CONTENUTO / VERBALE:\n${note.contenuto}\n`;
      if (note.obiettiviTavolino && note.obiettiviTavolino.length > 0) {
        text += `OBIETTIVI OPERATIVI:\n`;
        note.obiettiviTavolino.forEach((obj) => {
          text += `  - ${obj}\n`;
        });
      }
      text += `---------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agenda_Lavoro_Tavolino_Competenze_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Notebook Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
            <span>Diario di Bordo & Appunti di Seduta</span>
            <span aria-hidden="true">·</span>
            <span>Quaderno di Lavoro Nazionale</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Agenda del Tavolino delle Competenze
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Pianifica sessioni di lavoro, tavoli tecnici intersettoriali, verbali di confronto tra artigiani e tecnici innovatori, delibere e checklist operative scaricabili per lavorare anche offline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadAgendaNotesTxt}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 dark:border-stone-700"
          >
            <FileDown className="w-4 h-4 text-amber-600" />
            <span>Scarica Appunti (.txt)</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Nota di Lavoro</span>
          </button>
        </div>
      </div>

      {/* Add Note Form Modal/Collapsible */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-stone-900 rounded-xl p-6 border-2 border-amber-400 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-amber-600" />
              <span>Registra Nuova Nota di Lavoro o Verbale</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Chiudi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Titolo Seduta / Attività <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                placeholder="es. Verifica Competenze Meccatroniche e Botteghe Artigiane"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Data Seduta <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Settore di Riferimento
              </label>
              <select
                value={categoriaRif}
                onChange={(e) => setCategoriaRif(e.target.value as CategoryId)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
              >
                {CATEGORIE_PREDEFINITE.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Priorità Operativa
              </label>
              <select
                value={priorita}
                onChange={(e) => setPriorita(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
              >
                <option value="normale">Priorità Ordinaria</option>
                <option value="alta">Priorità Alta</option>
                <option value="urgente">Urgente / Delibera Immediata</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Note, Verbale & Sintesi Operativa <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={contenuto}
              onChange={(e) => setContenuto(e.target.value)}
              placeholder="Dettagli emersi durante il tavolo, partecipanti coinvolti, conclusioni e prossimi passi..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Obiettivi Chiave / Delibere (uno per riga)
            </label>
            <textarea
              rows={2}
              value={obiettiviInput}
              onChange={(e) => setObiettiviInput(e.target.value)}
              placeholder="Definizione linee guida\nRaccolta 10 pareri tecnici\nInvio delibera al comitato"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
            >
              Salva nel Quaderno
            </button>
          </div>
        </form>
      )}

      {/* Ruled Notebook Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notes.map((note) => {
          const cat = CATEGORIE_PREDEFINITE.find((c) => c.id === note.categoriaRif);
          return (
            <div
              key={note.id}
              className={`rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                note.completata
                  ? 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 opacity-80'
                  : 'bg-white dark:bg-stone-900 border-amber-300/80 dark:border-amber-900/60 shadow-xs'
              }`}
            >
              {/* Subtle top stripe indicating priority */}
              <div
                className={`h-1.5 w-full ${
                  note.priorita === 'urgente'
                    ? 'bg-rose-500'
                    : note.priorita === 'alta'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleComplete(note.id)}
                      className="text-stone-400 hover:text-amber-600 transition-colors"
                      title={note.completata ? 'Riapri nota' : 'Segna come completata'}
                    >
                      {note.completata ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3
                        className={`text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 ${
                          note.completata ? 'line-through text-stone-400' : ''
                        }`}
                      >
                        {note.titolo}
                      </h3>
                      <div className="flex items-center gap-2 text-2xs text-stone-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Data: {note.data}</span>
                        {cat && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{cat.nome}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Eliminare questa nota dall’agenda?')) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                    title="Elimina nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-line pl-7">
                  {note.contenuto}
                </p>

                {/* Objectives Checklist */}
                {note.obiettiviTavolino && note.obiettiviTavolino.length > 0 && (
                  <div className="pl-7 pt-2 space-y-1">
                    <div className="text-2xs font-bold uppercase tracking-wider text-stone-400">
                      Obiettivi & Risoluzioni del Tavolo:
                    </div>
                    <ul className="space-y-1">
                      {note.obiettiviTavolino.map((obj, i) => (
                        <li
                          key={i}
                          className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5"
                        >
                          <span className="text-amber-600 font-bold">›</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Note Footer */}
              <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 text-2xs text-stone-500 flex items-center justify-between">
                <span className="capitalize font-medium">Priorità: {note.priorita}</span>
                <span className="italic font-serif-italian">
                  {note.completata ? 'Archiviata in atti' : 'Attiva in agenda'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
