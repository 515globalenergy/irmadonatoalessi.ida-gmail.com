import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Upload, Sparkles, RefreshCw } from 'lucide-react';

export interface CoverOption {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const PRESET_COVERS: CoverOption[] = [
  {
    id: 'irma_finestra',
    name: 'Tavolino delle Competenze - Irma (Finestra sul Borgo)',
    description: 'Quaderno con calligrafia dedicato a Irma, caffè espresso, limoni e vista sul borgo italiano.',
    url: '/src/assets/images/tavolino_irma_notebook_1792338345686.jpg',
  },
  {
    id: 'irma_scrivania',
    name: 'Tavolino delle Competenze - Irma (Scrivania d’Autore)',
    description: 'Scrivania in legno rustico baciata dal sole, tazzina fumante, penna stilografica e quaderno d’Irma.',
    url: '/src/assets/images/tavolino_irma_desk_1792338346092.jpg',
  },
  {
    id: 'classico_pelle',
    name: 'Quaderno Artigianale in Pelle & Penna',
    description: 'Classica agenda in cuoio italiano aperto con righello d’architetto e inchiostro.',
    url: '/src/assets/images/agenda_italia_cover_1792337667508.jpg',
  },
];

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl: string;
  onSelectCover: (url: string) => void;
}

export const CoverImageModal: React.FC<CoverImageModalProps> = ({
  isOpen,
  onClose,
  currentCoverUrl,
  onSelectCover,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentCoverUrl);
  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomUploadUrl(result);
        setSelectedUrl(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApply = () => {
    onSelectCover(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Modifica Immagine di Copertina del Quaderno
              </h2>
              <p className="text-xs text-stone-400">
                Personalizza l'immagine ufficiale dell'Agenda del Tavolino delle Competenze
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Preview */}
          <div>
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Anteprima Immagine Selezionata
            </div>
            <div className="relative h-48 sm:h-60 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 shadow-inner bg-stone-900">
              <img
                src={selectedUrl}
                alt="Anteprima copertina"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-4">
                <div>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-stone-950 uppercase tracking-wider">
                    Copertina Attiva
                  </span>
                  <div className="text-white text-base sm:text-lg font-bold mt-1">
                    Tavolino delle Competenze Italia
                  </div>
                  <div className="text-stone-300 text-xs italic font-serif-italian">
                    Agenda Quaderno Digitale di Irma
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Options */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Scegli tra le Varianti Dedicate</span>
              <span className="text-amber-600 font-medium">3 versioni artistiche disponibili</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_COVERS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedUrl(preset.url)}
                  className={`rounded-xl border p-2.5 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedUrl === preset.url
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-400/50'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-800'
                  }`}
                >
                  <div className="relative h-28 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-900 mb-2">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {selectedUrl === preset.url && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {preset.name}
                    </div>
                    <div className="text-2xs text-stone-500 line-clamp-2 mt-0.5">
                      {preset.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Custom Photo (e.g. original photo "i miei primi 25€ - Irma") */}
          <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Carica una tua foto o scatto personale
                </div>
                <div className="text-2xs text-stone-500">
                  Puoi caricare la tua foto originale (es. "i miei primi 25€ - Irma") o un qualsiasi scatto dal tuo dispositivo per impostarlo come copertina.
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 rounded-lg cursor-pointer transition-colors shrink-0 shadow-xs">
              <Upload className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span>Sfoglia Foto...</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Applica come Copertina Attiva</span>
          </button>
        </div>
      </div>
    </div>
  );
};
