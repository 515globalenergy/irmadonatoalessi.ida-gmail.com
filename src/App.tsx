import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { NotebookTable } from './components/NotebookTable';
import { AgendaPlanner } from './components/AgendaPlanner';
import { TavolinoStats } from './components/TavolinoStats';
import { MemberModal } from './components/MemberModal';
import { MemberDetailDrawer } from './components/MemberDetailDrawer';
import { CloudBackupModal } from './components/CloudBackupModal';
import { CoverImageModal } from './components/CoverImageModal';
import { VetrinaVendite } from './components/VetrinaVendite';
import {
  CommunityMember,
  AgendaNote,
  ProductSaleItem,
  SaleTransaction,
  IrmaPaymentSettings,
} from './types/agenda';
import {
  DEFAULT_IRMA_PAYMENT_SETTINGS,
  INITIAL_PRODUCTS_FOR_SALE,
  INITIAL_SALES_TRANSACTIONS,
} from './data/categoriesAndSeed';
import {
  loadMembersFromStorage,
  saveMembersToStorage,
  loadNotesFromStorage,
  saveNotesToStorage,
  createCloudSnapshot,
  getLastCloudSyncTime,
} from './utils/cloudSync';
import { exportDatabaseToPDF } from './utils/pdfExport';
import { exportMembersToCSV } from './utils/csvExport';
import { Download, FileSpreadsheet, Cloud, ShieldCheck } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<CommunityMember[]>(() => loadMembersFromStorage());
  const [notes, setNotes] = useState<AgendaNote[]>(() => loadNotesFromStorage());
  const [currentTab, setCurrentTab] = useState<'foglio' | 'agenda' | 'quadro' | 'vetrina'>('foglio');

  // Irma Payment & Marketplace State
  const [paymentSettings, setPaymentSettings] = useState<IrmaPaymentSettings>(() => {
    try {
      const saved = localStorage.getItem('irma_payment_settings_v1');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_IRMA_PAYMENT_SETTINGS;
      return {
        ...parsed,
        whatsappLink: 'https://wa.me/393779953174',
        fondatriceNome: 'Irma Donato Alessi',
      };
    } catch {
      return DEFAULT_IRMA_PAYMENT_SETTINGS;
    }
  });

  const [products, setProducts] = useState<ProductSaleItem[]>(() => {
    try {
      const saved = localStorage.getItem('irma_community_products_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS_FOR_SALE;
    } catch {
      return INITIAL_PRODUCTS_FOR_SALE;
    }
  });

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('irma_sales_transactions_v1');
      return saved ? JSON.parse(saved) : INITIAL_SALES_TRANSACTIONS;
    } catch {
      return INITIAL_SALES_TRANSACTIONS;
    }
  });

  const [coverUrl, setCoverUrl] = useState<string>(
    () =>
      localStorage.getItem('tavolino_cover_url') ||
      '/src/assets/images/tavolino_irma_notebook_1792338345686.jpg'
  );
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [editingMember, setEditingMember] = useState<CommunityMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [onlyNewFilter, setOnlyNewFilter] = useState(false);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getLastCloudSyncTime());

  // Debounced auto-save & cloud backup trigger
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setSyncStatus('saving');
    saveMembersToStorage(members);
    saveNotesToStorage(notes);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      createCloudSnapshot(members, notes, 'Salvataggio Automatico Cloud');
      const nowIso = new Date().toISOString();
      setLastSyncTime(nowIso);
      setSyncStatus('synced');
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [members, notes]);

  // Handle member save (add or edit)
  const handleSaveMember = (member: CommunityMember) => {
    setMembers((prev) => {
      const existsIndex = prev.findIndex((m) => m.id === member.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = member;
        return next;
      } else {
        return [member, ...prev];
      }
    });
    setEditingMember(null);
  };

  // Handle member delete
  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMember?.id === id) {
      setSelectedMember(null);
    }
  };

  // Handle bulk import
  const handleImportMembers = (importedList: CommunityMember[]) => {
    setMembers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const fresh = importedList.filter((m) => !existingIds.has(m.id));
      return [...fresh, ...prev];
    });
  };

  // Handle agenda note actions
  const handleAddNote = (newNote: AgendaNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleToggleCompleteNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completata: !n.completata } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Handle snapshot restoration
  const handleRestoreSnapshot = (data: {
    members: CommunityMember[];
    notes: AgendaNote[];
  }) => {
    setMembers(data.members);
    setNotes(data.notes);
    saveMembersToStorage(data.members);
    saveNotesToStorage(data.notes);
    setLastSyncTime(new Date().toISOString());
    setSyncStatus('synced');
  };

  const newMembersCount = members.filter((m) => m.isNuovo).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* 3-Zone Top Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewMemberModal={() => {
          setEditingMember(null);
          setIsMemberModalOpen(true);
        }}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenCoverModal={() => setIsCoverModalOpen(true)}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        newMembersCount={newMembersCount}
      />

      {/* Main Work Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'foglio' && (
          <NotebookTable
            members={members}
            onSelectMember={(m) => setSelectedMember(m)}
            onEditMember={(m) => {
              setEditingMember(m);
              setIsMemberModalOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            onImportMembers={handleImportMembers}
            onOpenNewMemberModal={() => {
              setEditingMember(null);
              setIsMemberModalOpen(true);
            }}
            onlyNewFilter={onlyNewFilter}
            setOnlyNewFilter={setOnlyNewFilter}
          />
        )}

        {currentTab === 'vetrina' && (
          <VetrinaVendite
            products={products}
            transactions={transactions}
            settings={paymentSettings}
            onUpdateSettings={(newSettings) => {
              setPaymentSettings(newSettings);
              localStorage.setItem('irma_payment_settings_v1', JSON.stringify(newSettings));
            }}
            onAddProduct={(newProd) => {
              const updated = [newProd, ...products];
              setProducts(updated);
              localStorage.setItem('irma_community_products_v1', JSON.stringify(updated));
            }}
            onRecordSale={(newTx) => {
              const updated = [newTx, ...transactions];
              setTransactions(updated);
              localStorage.setItem('irma_sales_transactions_v1', JSON.stringify(updated));
            }}
          />
        )}

        {currentTab === 'agenda' && (
          <AgendaPlanner
            notes={notes}
            onAddNote={handleAddNote}
            onToggleComplete={handleToggleCompleteNote}
            onDeleteNote={handleDeleteNote}
            members={members}
          />
        )}

        {currentTab === 'quadro' && (
          <TavolinoStats
            members={members}
            coverUrl={coverUrl}
            onOpenCoverModal={() => setIsCoverModalOpen(true)}
            onFilterByCategory={(catId) => {
              setCurrentTab('foglio');
            }}
            onFilterByNew={() => {
              setOnlyNewFilter(true);
              setCurrentTab('foglio');
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Bar with Quick Downloads & Cloud Assurance */}
      <aside className="no-print bg-stone-900/95 text-stone-300 border-t border-stone-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">Tavolino delle Competenze</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-amber-400 font-medium">Creato da Irma Donato Alessi</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-400">Community creata da Irma Donato Alessi</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Backup Cloud Attivo</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportDatabaseToPDF(members, notes)}
              className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Scarica Registro PDF</span>
            </button>
            <span aria-hidden="true" className="text-stone-700">|</span>
            <button
              onClick={() => exportMembersToCSV(members)}
              className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Esporta CSV</span>
            </button>
            <span aria-hidden="true" className="text-stone-700">|</span>
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Gestione Cloud</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Member Creation / Editing Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialMember={editingMember}
      />

      {/* Member Details Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => {
          setSelectedMember(null);
          setEditingMember(m);
          setIsMemberModalOpen(true);
        }}
        onDelete={handleDeleteMember}
      />

      {/* Cloud Backup Management Modal */}
      <CloudBackupModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        members={members}
        notes={notes}
        lastSyncTime={lastSyncTime}
        onRestoreSnapshot={handleRestoreSnapshot}
        onTriggerManualBackup={() => {
          setLastSyncTime(new Date().toISOString());
          setSyncStatus('synced');
        }}
      />

      {/* Cover Image Customizer Modal */}
      <CoverImageModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        currentCoverUrl={coverUrl}
        onSelectCover={(newUrl) => {
          setCoverUrl(newUrl);
          localStorage.setItem('tavolino_cover_url', newUrl);
        }}
      />
    </div>
  );
}
