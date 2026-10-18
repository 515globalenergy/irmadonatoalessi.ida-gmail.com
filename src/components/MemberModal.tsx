import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { CommunityMember, CategoryId } from '../types/agenda';
import { CATEGORIE_PREDEFINITE, REGIONI_ITALIANE } from '../data/categoriesAndSeed';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: CommunityMember) => void;
  initialMember?: CommunityMember | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
}) => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [categoriaId, setCategoriaId] = useState<CategoryId>('artigianato');
  const [qualifica, setQualifica] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [localita, setLocalita] = useState('');
  const [cap, setCap] = useState('');
  const [provincia, setProvincia] = useState('');
  const [regione, setRegione] = useState('Lazio');
  const [competenzeInput, setCompetenzeInput] = useState('');
  const [isNuovo, setIsNuovo] = useState(true);
  const [note, setNote] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [stato, setStato] = useState<'attivo' | 'in verifica' | 'onorario'>('attivo');
  const [autorizzatoDa, setAutorizzatoDa] = useState('Irma Donato Alessi (Fondatrice & Creatrice)');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMember) {
      setNome(initialMember.nome);
      setCognome(initialMember.cognome);
      setCategoriaId(initialMember.categoriaId);
      setQualifica(initialMember.qualifica);
      setTelefono(initialMember.telefono);
      setEmail(initialMember.email);
      setIndirizzo(initialMember.indirizzo);
      setLocalita(initialMember.localita);
      setCap(initialMember.cap);
      setProvincia(initialMember.provincia);
      setRegione(initialMember.regione);
      setCompetenzeInput(initialMember.competenze.join(', '));
      setIsNuovo(initialMember.isNuovo);
      setNote(initialMember.note || '');
      setCodiceFiscale(initialMember.codiceFiscale || '');
      setStato(initialMember.stato);
      setAutorizzatoDa(initialMember.autorizzatoDa || 'Irma Donato Alessi (Fondatrice & Creatrice)');
    } else {
      // Default reset
      setNome('');
      setCognome('');
      setCategoriaId('artigianato');
      setQualifica('');
      setTelefono('+39 ');
      setEmail('');
      setIndirizzo('');
      setLocalita('');
      setCap('');
      setProvincia('');
      setRegione('Lazio');
      setCompetenzeInput('');
      setIsNuovo(true);
      setNote('');
      setCodiceFiscale('');
      setStato('attivo');
      setAutorizzatoDa('Irma Donato Alessi (Fondatrice & Creatrice)');
    }
    setErrors({});
  }, [initialMember, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = 'Il nome è obbligatorio.';
    if (!cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio.';
    if (!qualifica.trim()) newErrors.qualifica = 'La qualifica professionale è obbligatoria.';
    if (!telefono.trim() || telefono.trim() === '+39') newErrors.telefono = 'Il numero telefonico è obbligatorio.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Inserisci un indirizzo email valido.';
    if (!localita.trim()) newErrors.localita = 'La località / comune è obbligatoria.';
    if (!provincia.trim()) newErrors.provincia = 'Indica la provincia (sigla, es. RM, MI, NA).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const competenzeList = competenzeInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const savedMember: CommunityMember = {
      id: initialMember?.id || `tc-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      nome: nome.trim(),
      cognome: cognome.trim(),
      categoriaId,
      qualifica: qualifica.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      indirizzo: indirizzo.trim(),
      localita: localita.trim(),
      cap: cap.trim() || '00100',
      provincia: provincia.trim().toUpperCase().slice(0, 2),
      regione,
      competenze: competenzeList.length > 0 ? competenzeList : ['Competenza Generica Certificata'],
      dataInserimento: initialMember?.dataInserimento || new Date().toISOString().split('T')[0],
      isNuovo,
      stato,
      autorizzatoDa: autorizzatoDa.trim() || 'Irma Donato Alessi (Fondatrice & Creatrice)',
      dataAutorizzazione: initialMember?.dataAutorizzazione || new Date().toISOString().split('T')[0],
      note: note.trim(),
      codiceFiscale: codiceFiscale.trim().toUpperCase(),
    };

    onSave(savedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm">
              TC
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialMember ? 'Modifica Anagrafica Membro' : 'Nuovo Inserito nella Community'}
              </h2>
              <p className="text-xs text-stone-400">
                Tavolino delle Competenze Italia · Registrazione Ufficiale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Top banner highlighting new community addition */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                I dati registrati saranno archiviati nel foglio mastro e sincronizzati automaticamente con il cloud.
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium shrink-0 ml-3">
              <input
                type="checkbox"
                checked={isNuovo}
                onChange={(e) => setIsNuovo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
              />
              <span>Segna come "Nuovo Inserito"</span>
            </label>
          </div>

          {/* Section 1: Anagrafica Nominativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nome <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="es. Marco, Elena, Antonio"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.nome ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.nome && <p className="text-xs text-rose-600 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Cognome <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="es. Rossi, Bianchi, Moretti"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.cognome ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.cognome && <p className="text-xs text-rose-600 mt-1">{errors.cognome}</p>}
            </div>
          </div>

          {/* Section 2: Categoria Predefinita & Qualifica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Categoria Predefinita <span className="text-rose-600">*</span>
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value as CategoryId)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIE_PREDEFINITE.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <p className="text-2xs text-stone-500 mt-1">
                {CATEGORIE_PREDEFINITE.find((c) => c.id === categoriaId)?.descrizione}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Qualifica / Titolo Professionale <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={qualifica}
                onChange={(e) => setQualifica(e.target.value)}
                placeholder="es. Maestro Ebanista, Architetto Cloud, Avvocato Giuslavorista"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.qualifica ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.qualifica && <p className="text-xs text-rose-600 mt-1">{errors.qualifica}</p>}
            </div>
          </div>

          {/* Section 3: Recapiti Telefonici e Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Numero Telefonico <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+39 06 1234567 / +39 340 1234567"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.telefono ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.telefono && <p className="text-xs text-rose-600 mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Indirizzo Email <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.cognome@ente.it"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.email ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Section 4: Indirizzo e Località (Comune, CAP, Provincia, Regione) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Indirizzo Civico (Via / Piazza e Numero)
              </label>
              <input
                type="text"
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
                placeholder="es. Via dei Condotti, 15 / Corso Vittorio Emanuele, 82"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Località (Comune) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={localita}
                  onChange={(e) => setLocalita(e.target.value)}
                  placeholder="es. Firenze, Milano"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.localita ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  CAP
                </label>
                <input
                  type="text"
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  placeholder="es. 50124"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Provincia (Sigla) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value.toUpperCase())}
                  placeholder="es. FI, MI, RM"
                  className={`w-full px-3 py-2 text-sm uppercase rounded-lg border bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.provincia ? 'border-rose-500' : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Regione
                </label>
                <select
                  value={regione}
                  onChange={(e) => setRegione(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {REGIONI_ITALIANE.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Competenze Specifiche & Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Competenze Chiave (separate da virgola)
            </label>
            <input
              type="text"
              value={competenzeInput}
              onChange={(e) => setCompetenzeInput(e.target.value)}
              placeholder="es. Restauro Ligneo, Lucidatura a Tampone, Perizia Storica"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Codice Fiscale (opzionale)
              </label>
              <input
                type="text"
                value={codiceFiscale}
                onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                placeholder="16 caratteri alfanumerici"
                className="w-full px-3 py-2 text-sm uppercase rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Stato Membro nel Tavolino
              </label>
              <select
                value={stato}
                onChange={(e) => setStato(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="attivo">Attivo nel Tavolino</option>
                <option value="in verifica">In fase di verifica istruttoria</option>
                <option value="onorario">Membro Onorario / Maestro Benemerito</option>
              </select>
            </div>
          </div>

          {/* Section: Autorizzazione Ingresso Irma Donato Alessi */}
          <div className="p-3.5 rounded-lg border-2 border-amber-300 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                Autorizzazione all'Ingresso nella Community <span className="text-rose-600">*</span>
              </label>
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-stone-900 dark:text-amber-100">
                Regola di Ammissione
              </span>
            </div>
            <p className="text-2xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif-italian">
              <strong>Nota Istituzionale:</strong> La community e l'idea originale sono state create da <strong>Irma Donato Alessi</strong>. Fino ad oggi le persone sono entrate esclusivamente con la sua autorizzazione espressa.
            </p>
            <input
              type="text"
              required
              value={autorizzatoDa}
              onChange={(e) => setAutorizzatoDa(e.target.value)}
              placeholder="es. Irma Donato Alessi (Fondatrice & Creatrice)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Note Operative & Disponibilità
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note di servizio, disponibilità per audizioni o progetti speciali del Tavolino Competenze..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-transparent rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialMember ? 'Aggiorna Anagrafica' : 'Salva Nuovo Inserito'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
