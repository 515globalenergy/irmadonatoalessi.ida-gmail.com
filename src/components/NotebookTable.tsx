import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { CommunityMember, CategoryId } from '../types/agenda';
import { CATEGORIE_PREDEFINITE, REGIONI_ITALIANE } from '../data/categoriesAndSeed';
import { exportMembersToCSV, parseCSVToMembers } from '../utils/csvExport';
import { exportDatabaseToPDF } from '../utils/pdfExport';

interface NotebookTableProps {
  members: CommunityMember[];
  onSelectMember: (member: CommunityMember) => void;
  onEditMember: (member: CommunityMember) => void;
  onDeleteMember: (id: string) => void;
  onImportMembers: (newMembers: CommunityMember[]) => void;
  onOpenNewMemberModal: () => void;
  onlyNewFilter: boolean;
  setOnlyNewFilter: (val: boolean) => void;
}

export const NotebookTable: React.FC<NotebookTableProps> = ({
  members,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onImportMembers,
  onOpenNewMemberModal,
  onlyNewFilter,
  setOnlyNewFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'city'>('recent');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<CommunityMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(CATEGORIE_PREDEFINITE.map((c) => [c.id, c])),
    []
  );

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Quick search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = `${m.nome} ${m.cognome}`.toLowerCase().includes(q);
          const matchQual = m.qualifica.toLowerCase().includes(q);
          const matchLoc = `${m.localita} ${m.provincia} ${m.regione} ${m.indirizzo}`
            .toLowerCase()
            .includes(q);
          const matchTel = m.telefono.toLowerCase().includes(q);
          const matchEmail = m.email.toLowerCase().includes(q);
          const matchCat = (categoryMap.get(m.categoriaId)?.nome || '').toLowerCase().includes(q);
          const matchComp = m.competenze.some((c) => c.toLowerCase().includes(q));

          if (!matchName && !matchQual && !matchLoc && !matchTel && !matchEmail && !matchCat && !matchComp) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && m.categoriaId !== selectedCategory) {
          return false;
        }

        // Region filter
        if (selectedRegion !== 'all' && m.regione !== selectedRegion) {
          return false;
        }

        // Only new filter
        if (onlyNewFilter && !m.isNuovo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.dataInserimento).getTime() - new Date(a.dataInserimento).getTime();
        }
        if (sortBy === 'name') {
          return a.cognome.localeCompare(b.cognome);
        }
        if (sortBy === 'city') {
          return a.localita.localeCompare(b.localita);
        }
        return 0;
      });
  }, [members, searchTerm, selectedCategory, selectedRegion, onlyNewFilter, sortBy, categoryMap]);

  const newCount = useMemo(() => members.filter((m) => m.isNuovo).length, [members]);

  // Handle CSV file upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseCSVToMembers(content);
        if (parsed.length > 0) {
          const complete: CommunityMember[] = parsed.map((p, idx) => ({
            id: p.id || `tc-import-${Date.now()}-${idx}`,
            nome: p.nome || 'Membro',
            cognome: p.cognome || '',
            categoriaId: (p.categoriaId as CategoryId) || 'artigianato',
            qualifica: p.qualifica || 'Professionista Accreditato',
            telefono: p.telefono || '+39 06 000000',
            email: p.email || 'info@tavolinocompetenze.it',
            indirizzo: p.indirizzo || '',
            localita: p.localita || 'Roma',
            cap: p.cap || '00100',
            provincia: p.provincia || 'RM',
            regione: p.regione || 'Lazio',
            competenze: p.competenze || [],
            dataInserimento: p.dataInserimento || new Date().toISOString().split('T')[0],
            isNuovo: true,
            stato: 'attivo',
            autorizzatoDa: p.autorizzatoDa || 'Irma Donato Alessi (Fondatrice)',
            dataAutorizzazione: p.dataAutorizzazione || new Date().toISOString().split('T')[0],
            note: p.note || 'Importato da file CSV',
          }));
          onImportMembers(complete);
          setToastMessage(`Importati con successo ${complete.length} professionisti nel registro!`);
        } else {
          setToastMessage('Nessun dato valido trovato nel file CSV.');
        }
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Editorial Header & National Context Card */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 tracking-wide uppercase">
              <span>Foglio Mastro Community</span>
              <span aria-hidden="true">·</span>
              <span>Creata da Irma Donato Alessi</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{members.length} Professionisti Iscritti</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Tavolino delle Competenze · Creato da Irma Donato Alessi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              Archivio operativo di maestri artigiani, formatori e innovatori della community fondata da <strong>Irma Donato Alessi</strong>. Gestione contatti, qualifiche, vetrina vendite con percentuali e backup automatico su cloud.
            </p>
          </div>

          {/* Quick Export & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Esporta PDF */}
            <button
              onClick={() => exportDatabaseToPDF(members)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-300 dark:border-stone-700"
              title="Esporta registro completo in formato PDF ufficiale A4 landscape"
            >
              <Download className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Scarica PDF</span>
            </button>

            {/* Esporta CSV */}
            <button
              onClick={() => exportMembersToCSV(members)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-300 dark:border-stone-700"
              title="Esporta database in formato CSV compatibile Microsoft Excel e Numbers"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Esporta CSV</span>
            </button>

            {/* Importa CSV */}
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-300 dark:border-stone-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Importa CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            {/* Stampa Registro */}
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-300 dark:border-stone-700"
              title="Stampa diretta del foglio registro"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Stampa</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ricerca rapida: nominativo, qualifica, comune, telefono, email, competenze..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Cancella
              </button>
            )}
          </div>

          {/* Quick Filter: Nuovi Inseriti Toggle */}
          <button
            onClick={() => setOnlyNewFilter(!onlyNewFilter)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              onlyNewFilter
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Nuovi Inseriti Community</span>
            <span className="tabular-nums px-1.5 py-0.2 bg-stone-900 text-amber-300 text-2xs rounded">
              {newCount}
            </span>
          </button>

          {/* View mode toggle (Table / Cards) */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Vista Tabella Foglio Mastro"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Vista Schede Quaderno"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Categorie, Regioni & Ordinamento */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          {/* Categoria Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Categoria:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Tutte le Categorie ({members.length})</option>
              {CATEGORIE_PREDEFINITE.map((cat) => {
                const count = members.filter((m) => m.categoriaId === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Regione Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Regione:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Tutte le Regioni</option>
              {REGIONI_ITALIANE.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Ordinamento */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-stone-500 font-medium">Ordina per:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="recent">Data Inserimento (Più Recenti)</option>
              <option value="name">Cognome (A - Z)</option>
              <option value="city">Località (A - Z)</option>
            </select>
          </div>

          {/* Active filters clear */}
          {(searchTerm || selectedCategory !== 'all' || selectedRegion !== 'all' || onlyNewFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedRegion('all');
                setOnlyNewFilter(false);
              }}
              className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 hover:underline font-medium"
            >
              Reimposta filtri
            </button>
          )}
        </div>
      </div>

      {/* RESULTS COUNT & META */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div>
          Mostrati <span className="font-semibold text-stone-900 dark:text-stone-200 tabular-nums">{filteredMembers.length}</span> di <span className="tabular-nums">{members.length}</span> professionisti registrati
          {onlyNewFilter && ' · Solo Nuovi Inseriti'}
        </div>
        <div className="text-stone-400">
          Tavolino Competenze Italia · Quaderno Digitale
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Nominativo & Titolo</th>
                  <th className="py-3 px-4">Categoria Predefinita</th>
                  <th className="py-3 px-4">Qualifica</th>
                  <th className="py-3 px-4">Località & Regione</th>
                  <th className="py-3 px-4">Autorizzazione Ingresso</th>
                  <th className="py-3 px-4 text-center">Inserimento</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                          Nessun professionista trovato
                        </h3>
                        <p className="text-xs text-stone-500">
                          Nessun record corrisponde ai criteri di ricerca o ai filtri selezionati. Prova a modificare i filtri o aggiungi un nuovo inserito.
                        </p>
                        <button
                          onClick={onOpenNewMemberModal}
                          className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
                        >
                          + Nuovo Inserito nella Community
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const cat = categoryMap.get(member.categoriaId);
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-amber-50/40 dark:hover:bg-stone-800/50 transition-colors group"
                      >
                        {/* Column 1: Nominativo */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-start gap-2">
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                                <span>{member.cognome ? `${member.cognome} ${member.nome}` : member.nome}</span>
                                {member.isNuovo && (
                                  <span className="text-2xs font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    Nuovo
                                  </span>
                                )}
                              </div>
                              <div className="text-2xs text-stone-500 font-mono mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span>ID: {member.id}</span>
                                {member.codiceFiscale && (
                                  <span className="font-bold text-amber-700 dark:text-amber-400">· CF: {member.codiceFiscale}</span>
                                )}
                                {member.dataNascita && (
                                  <span className="text-stone-600 dark:text-stone-400">· Nascita: {member.dataNascita}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Categoria Predefinita */}
                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-2xs font-medium ${
                              cat?.badgeBg || 'bg-stone-100'
                            } ${cat?.badgeText || 'text-stone-700'}`}
                          >
                            {cat?.nome || member.categoriaId}
                          </span>
                        </td>

                        {/* Column 3: Qualifica */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-stone-800 dark:text-stone-200">
                            {member.qualifica}
                          </div>
                          {member.competenze.length > 0 && (
                            <div className="text-2xs text-stone-500 mt-0.5 line-clamp-1">
                              {member.competenze.slice(0, 2).join(' · ')}
                            </div>
                          )}
                        </td>

                        {/* Column 4: Recapiti Diretti */}
                        {/* Column 4: Località & Recapiti */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-center gap-1 text-stone-800 dark:text-stone-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{member.localita} ({member.provincia})</span>
                          </div>
                          <div className="text-2xs text-stone-500 mt-0.5">
                            {member.regione}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-stone-100 dark:border-stone-800 text-2xs font-mono">
                            <a
                              href={`tel:${member.telefono.replace(/\s+/g, '')}`}
                              className="text-stone-600 dark:text-stone-400 hover:text-amber-700 flex items-center gap-1"
                              title="Chiama"
                            >
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{member.telefono}</span>
                            </a>
                            <a
                              href={`mailto:${member.email}`}
                              className="text-stone-600 dark:text-stone-400 hover:text-amber-700 flex items-center gap-1"
                              title="Invia Email"
                            >
                              <Mail className="w-3 h-3 text-stone-400" />
                            </a>
                          </div>
                        </td>

                        {/* Column 5: Autorizzazione Ingresso */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[170px]">{member.autorizzatoDa || 'Irma Donato Alessi (Fondatrice)'}</span>
                          </div>
                          <div className="text-3xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                            Autorizzato da Irma · {member.dataAutorizzazione || member.dataInserimento}
                          </div>
                        </td>

                        {/* Column 6: Inserimento */}
                        <td className="py-3 px-4 align-top text-center tabular-nums text-2xs text-stone-500">
                          {member.dataInserimento}
                        </td>

                        {/* Column 7: Azioni */}
                        <td className="py-3 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectMember(member)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                              title="Visualizza Scheda Dettagliata"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditMember(member)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                              title="Modifica Anagrafica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmMember(member)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD DOSSIER VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const cat = categoryMap.get(member.categoriaId);
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        cat?.badgeBg || 'bg-stone-100'
                      } ${cat?.badgeText || 'text-stone-700'}`}
                    >
                      {cat?.nome || member.categoriaId}
                    </span>
                    {member.isNuovo && (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-stone-950">
                        Nuovo Inserito
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 transition-colors">
                    {member.cognome ? `${member.cognome} ${member.nome}` : member.nome}
                  </h3>
                  <p className="text-xs font-serif-italian italic text-stone-600 dark:text-stone-400 mt-0.5">
                    {member.qualifica}
                  </p>
                  <div className="text-2xs text-stone-500 font-mono mt-1 flex flex-wrap items-center gap-1.5">
                    {member.codiceFiscale && (
                      <span className="font-bold text-amber-700 dark:text-amber-400">CF: {member.codiceFiscale}</span>
                    )}
                    {member.dataNascita && (
                      <span className="text-stone-600 dark:text-stone-400">· Nascita: {member.dataNascita}</span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-stone-100 dark:border-stone-800 pt-3">
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{member.localita} ({member.provincia}), {member.regione}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-mono text-2xs">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{member.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-2xs truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {member.competenze.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.competenze.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-3xs rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-3xs text-stone-400">
                    Ins. {member.dataInserimento}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectMember(member)}
                      className="px-2.5 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded"
                    >
                      Dettaglio
                    </button>
                    <button
                      onClick={() => onEditMember(member)}
                      className="p-1 text-stone-400 hover:text-stone-800"
                      title="Modifica"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Conferma Eliminazione
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Sei sicuro di voler eliminare dal registro il nominativo{' '}
              <strong className="text-stone-900 dark:text-stone-100">
                {deleteConfirmMember.nome} {deleteConfirmMember.cognome}
              </strong>
              ? Questa azione non può essere annullata.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onDeleteMember(deleteConfirmMember.id);
                  setDeleteConfirmMember(null);
                  setToastMessage('Nominativo rimosso con successo.');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Conferma Eliminazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-stone-700 text-xs flex items-center gap-3">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
