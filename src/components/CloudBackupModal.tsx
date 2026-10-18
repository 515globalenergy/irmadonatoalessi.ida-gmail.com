import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Database,
  History,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CloudBackupSnapshot, CommunityMember, AgendaNote } from '../types/agenda';
import {
  getCloudSnapshots,
  createCloudSnapshot,
  downloadFullDatabaseJSON,
} from '../utils/cloudSync';
import { INITIAL_COMMUNITY_MEMBERS, INITIAL_AGENDA_NOTES } from '../data/categoriesAndSeed';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: CommunityMember[];
  notes: AgendaNote[];
  lastSyncTime: string;
  onRestoreSnapshot: (data: { members: CommunityMember[]; notes: AgendaNote[] }) => void;
  onTriggerManualBackup: () => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  members,
  notes,
  lastSyncTime,
  onRestoreSnapshot,
  onTriggerManualBackup,
}) => {
  const [snapshots, setSnapshots] = useState<CloudBackupSnapshot[]>(() => getCloudSnapshots());
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setFeedbackMsg(null);
    setTimeout(() => {
      const snap = createCloudSnapshot(
        members,
        notes,
        `Backup Manuale dell'Operatore - ${new Date().toLocaleTimeString('it-IT')}`
      );
      setSnapshots(getCloudSnapshots());
      onTriggerManualBackup();
      setIsBackingUp(false);
      setFeedbackMsg('Backup su cloud completato con successo!');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }, 600);
  };

  const handleRestore = (snap: CloudBackupSnapshot) => {
    if (
      window.confirm(
        `Sei sicuro di voler ripristinare il backup del ${new Date(
          snap.timestamp
        ).toLocaleString('it-IT')} con ${snap.memberCount} professionisti e ${
          snap.noteCount
        } note? I dati correnti verranno sovrascritti.`
      )
    ) {
      onRestoreSnapshot(snap.data);
      setFeedbackMsg(`Snapshot ripristinato con successo: ${snap.label}`);
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1500);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && Array.isArray(parsed.members)) {
          onRestoreSnapshot({
            members: parsed.members,
            notes: parsed.notes || [],
          });
          setFeedbackMsg(
            `Importati con successo ${parsed.members.length} membri e ${parsed.notes?.length || 0} note.`
          );
          setTimeout(() => {
            setFeedbackMsg(null);
            onClose();
          }, 1500);
        } else {
          alert('Formato file JSON non valido. Manca il registro "members".');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON di backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Ripristinare il database iniziale del Tavolino delle Competenze Italia con i profili dei maestri artigiani e referenti nazionali?'
      )
    ) {
      onRestoreSnapshot({
        members: INITIAL_COMMUNITY_MEMBERS,
        notes: INITIAL_AGENDA_NOTES,
      });
      setFeedbackMsg('Dati iniziali ufficiali ripristinati.');
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Gestione Backup Cloud & Archiviazione Sicura
              </h2>
              <p className="text-xs text-stone-400">
                Tavolino delle Competenze Italia · Sincronizzazione Automatica
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {feedbackMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Cloud Auto-Sync Status Box */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Backup Automatico su Cloud Attivo
                </div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  Sincronizzazione continua ad ogni modifica
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 tabular-nums">
                  Ultimo checkpoint: {new Date(lastSyncTime).toLocaleString('it-IT')}
                </div>
              </div>
            </div>

            <button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Sincronizzazione...' : 'Forza Backup Ora'}</span>
            </button>
          </div>

          {/* Export & Import Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-2">
              <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-600" />
                <span>Scarica Archivio JSON Completo</span>
              </div>
              <p className="text-xs text-stone-500">
                Scarica una copia portabile dell'intero database (membri, note, date, qualifiche) per custodia offline.
              </p>
              <button
                onClick={() => downloadFullDatabaseJSON(members, notes)}
                className="w-full mt-2 py-2 px-3 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Scarica Backup (.json)</span>
              </button>
            </div>

            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-2">
              <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Ripristina da File JSON</span>
              </div>
              <p className="text-xs text-stone-500">
                Carica un archivio JSON precedentemente scaricato per ripristinare o migrare i dati.
              </p>
              <label className="w-full mt-2 py-2 px-3 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Seleziona File JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Snapshot History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-stone-500" />
                <span>Punti di Ripristino Snapshot Cloud ({snapshots.length})</span>
              </h3>
            </div>

            <div className="border border-stone-200 dark:border-stone-800 rounded-lg divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden max-h-52 overflow-y-auto">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-white dark:bg-stone-900 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {snap.label}
                    </div>
                    <div className="text-stone-500 text-2xs flex items-center gap-2 mt-0.5 tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(snap.timestamp).toLocaleString('it-IT')}</span>
                      <span>·</span>
                      <span>{snap.memberCount} Iscritti</span>
                      <span>·</span>
                      <span>{snap.noteCount} Note</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(snap)}
                    className="flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded hover:bg-amber-100 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ripristina</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Reset seed */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              Necessità di ripristinare il set di dati di fabbrica?
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
            >
              Reimposta Dati Nazionali Iniziali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
