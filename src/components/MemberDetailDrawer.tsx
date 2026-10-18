import React from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Edit2,
  Trash2,
  ExternalLink,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { CommunityMember } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';
import { exportSingleMemberPDF } from '../utils/pdfExport';

interface MemberDetailDrawerProps {
  member: CommunityMember | null;
  onClose: () => void;
  onEdit: (member: CommunityMember) => void;
  onDelete: (id: string) => void;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  member,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!member) return null;

  const category = CATEGORIE_PREDEFINITE.find((c) => c.id === member.categoriaId);
  const mapQuery = encodeURIComponent(
    `${member.indirizzo}, ${member.localita}, ${member.provincia}, Italia`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 shadow-2xl h-full flex flex-col border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 bg-stone-900 text-white flex items-start justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                {member.id}
              </span>
              {member.isNuovo && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-stone-950">
                  Nuovo Inserito
                </span>
              )}
              <span className="text-xs text-stone-400">
                · Iscritto il {member.dataInserimento}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {member.nome} {member.cognome}
            </h2>
            <p className="text-sm text-stone-300 mt-0.5 font-serif-italian italic">
              {member.qualifica}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Authorization Certificate Banner */}
          <div className="p-3.5 rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                Ammesso nella Community con Autorizzazione Ufficiale
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {member.autorizzatoDa || 'Irma Donato Alessi (Fondatrice & Creatrice)'}
              </div>
              <div className="text-2xs text-stone-500 mt-1">
                Fino ad oggi tutte le persone sono entrate esclusivamente con l'autorizzazione di Irma Donato Alessi, titolare e ideatrice della Community.
              </div>
            </div>
          </div>

          {/* Category Banner */}
          <div className="p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60">
            <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-1">
              Settore di Competenza Nazionale
            </div>
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{category?.nome || member.categoriaId}</span>
            </div>
            {category?.descrizione && (
              <p className="text-xs text-stone-500 mt-1">{category.descrizione}</p>
            )}
          </div>

          {/* Contact Direct Actions */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Recapiti & Comunicazioni Dirette
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${member.telefono.replace(/\s+/g, '')}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-500 bg-white dark:bg-stone-800/80 hover:bg-amber-50/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs text-stone-500">Telefono Diretto</div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700">
                    {member.telefono}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-500 bg-white dark:bg-stone-800/80 hover:bg-amber-50/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs text-stone-500">Indirizzo Email</div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700">
                    {member.email}
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Location & Address */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Sede Operativa & Localizzazione
            </h3>
            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {member.indirizzo || 'Indirizzo su richiesta'}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {member.cap} {member.localita} ({member.provincia}) · {member.regione}
                  </div>
                  {member.codiceFiscale && (
                    <div className="text-xs font-mono text-stone-500 mt-2">
                      CF: {member.codiceFiscale}
                    </div>
                  )}
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md hover:bg-stone-100 transition-colors shrink-0"
              >
                <span>Mappa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Certified Skills */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Competenze Riconosciute & Specializzazioni
            </h3>
            <div className="flex flex-wrap gap-2">
              {member.competenze.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 font-medium"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Operational Notes */}
          {member.note && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Note di Servizio & Collaborazioni Attive
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-300 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200 dark:border-stone-800 leading-relaxed">
                {member.note}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Actions */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Rimuovere ${member.nome} ${member.cognome} dal registro del Tavolino delle Competenze?`
                )
              ) {
                onDelete(member.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Elimina</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleMemberPDF(member)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Scarica Scheda PDF</span>
            </button>

            <button
              onClick={() => {
                onEdit(member);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Modifica Dati</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
