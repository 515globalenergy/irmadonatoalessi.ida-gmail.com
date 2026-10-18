import { CommunityMember, AgendaNote, CloudBackupSnapshot } from '../types/agenda';
import { INITIAL_COMMUNITY_MEMBERS, INITIAL_AGENDA_NOTES } from '../data/categoriesAndSeed';

const STORAGE_KEY_MEMBERS = 'tavolino_competenze_members_v1';
const STORAGE_KEY_NOTES = 'tavolino_competenze_notes_v1';
const STORAGE_KEY_BACKUPS = 'tavolino_competenze_cloud_snapshots_v1';
const STORAGE_KEY_LAST_SYNC = 'tavolino_competenze_last_sync_v1';

const DUMMY_IDS = new Set([
  'tc-001', 'tc-002', 'tc-003', 'tc-004', 'tc-005', 'tc-006',
  'tc-007', 'tc-008', 'tc-009', 'tc-010', 'tc-011', 'tc-012'
]);

export function loadMembersFromStorage(): CommunityMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) {
      saveMembersToStorage(INITIAL_COMMUNITY_MEMBERS);
      return INITIAL_COMMUNITY_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // 1. Remove all old dummy members with fake tax codes / numbers
      const cleaned = parsed.filter((m) => !DUMMY_IDS.has(m.id));

      // 2. Ensure Irma has her exact official verified data
      const irmaOfficial = INITIAL_COMMUNITY_MEMBERS[0];
      const otherOfficial = INITIAL_COMMUNITY_MEMBERS.slice(1);

      // Map to update Irma and verify members
      const updatedList: CommunityMember[] = cleaned.map((m) => {
        if (m.id === 'tc-irma-fondatrice' || (m.nome === 'Irma' && m.cognome && m.cognome.includes('Donato'))) {
          return {
            ...m,
            ...irmaOfficial,
            dataNascita: '05/06/1969',
            codiceFiscale: 'DNTRMI69H45F158I',
            telefono: '+39 377 9953174',
            localita: 'Messina',
            provincia: 'ME',
            regione: 'Sicilia',
            cap: '98122',
            autorizzatoDa: "Creatrice & Fondatrice dell'Idea (Unica Autorità)",
          };
        }
        // If it's one of the official members, ensure accurate phone and authorization
        const matchOfficial = otherOfficial.find(
          (o) => o.id === m.id || (o.nome.toLowerCase() === m.nome.toLowerCase() && (o.cognome || '').toLowerCase() === (m.cognome || '').toLowerCase())
        );
        if (matchOfficial) {
          return {
            ...m,
            ...matchOfficial,
            telefono: matchOfficial.telefono,
            autorizzatoDa: 'Irma Donato Alessi (Fondatrice & Creatrice)',
          };
        }
        return {
          ...m,
          autorizzatoDa: m.autorizzatoDa || 'Irma Donato Alessi (Fondatrice & Creatrice)',
        };
      });

      // 3. Make sure Irma and all authentic members provided by Irma exist in the list
      const hasIrma = updatedList.some((m) => m.id === 'tc-irma-fondatrice' || m.nome === 'Irma');
      if (!hasIrma) {
        updatedList.unshift(irmaOfficial);
      }

      // Add any missing official members
      for (const off of otherOfficial) {
        const exists = updatedList.some(
          (m) => m.id === off.id || (m.nome.toLowerCase() === off.nome.toLowerCase() && (m.cognome || '').toLowerCase() === (off.cognome || '').toLowerCase())
        );
        if (!exists) {
          updatedList.push(off);
        }
      }

      // Save sanitized list
      saveMembersToStorage(updatedList);
      return updatedList;
    }
    saveMembersToStorage(INITIAL_COMMUNITY_MEMBERS);
    return INITIAL_COMMUNITY_MEMBERS;
  } catch (e) {
    console.warn('Errore lettura membri dal storage:', e);
    return INITIAL_COMMUNITY_MEMBERS;
  }
}

export function saveMembersToStorage(members: CommunityMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Errore salvataggio membri:', e);
  }
}

export function loadNotesFromStorage(): AgendaNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      saveNotesToStorage(INITIAL_AGENDA_NOTES);
      return INITIAL_AGENDA_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AGENDA_NOTES;
  } catch (e) {
    console.warn('Errore lettura appunti dal storage:', e);
    return INITIAL_AGENDA_NOTES;
  }
}

export function saveNotesToStorage(notes: AgendaNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Errore salvataggio note:', e);
  }
}

export function getCloudSnapshots(): CloudBackupSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BACKUPS);
    if (!raw) {
      // Create initial snapshot
      const initialSnapshot: CloudBackupSnapshot = {
        id: 'snapshot-genesis',
        timestamp: new Date().toISOString(),
        memberCount: INITIAL_COMMUNITY_MEMBERS.length,
        noteCount: INITIAL_AGENDA_NOTES.length,
        label: 'Inizializzazione Tavolino Competenze Italia',
        sizeBytes: 14200,
        data: {
          members: INITIAL_COMMUNITY_MEMBERS,
          notes: INITIAL_AGENDA_NOTES,
          version: '1.0.0',
          lastSaved: new Date().toISOString(),
        },
      };
      localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify([initialSnapshot]));
      return [initialSnapshot];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Errore lettura snapshot cloud:', e);
    return [];
  }
}

export function createCloudSnapshot(
  members: CommunityMember[],
  notes: AgendaNote[],
  label: string = 'Backup Automatico Cloud'
): CloudBackupSnapshot {
  const currentSnapshots = getCloudSnapshots();
  const serialized = JSON.stringify({ members, notes });
  const snapshot: CloudBackupSnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString(),
    memberCount: members.length,
    noteCount: notes.length,
    label,
    sizeBytes: new Blob([serialized]).size,
    data: {
      members,
      notes,
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
    },
  };

  // Keep last 15 snapshots
  const updated = [snapshot, ...currentSnapshots].slice(0, 15);
  localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(updated));
  localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());

  return snapshot;
}

export function getLastCloudSyncTime(): string {
  return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || new Date().toISOString();
}

export function downloadFullDatabaseJSON(members: CommunityMember[], notes: AgendaNote[]): void {
  const exportPayload = {
    manifest: 'Tavolino delle Competenze Italia - Backup Integrale',
    app: 'Agenda Quaderno Digitale Community',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    totalMembers: members.length,
    totalNotes: notes.length,
    members,
    notes,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `Backup_Cloud_Tavolino_Competenze_Italia_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
