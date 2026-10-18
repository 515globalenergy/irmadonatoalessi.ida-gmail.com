export type CategoryId =
  | 'artigianato'
  | 'digitale'
  | 'istruzione'
  | 'giuridico'
  | 'sanita'
  | 'agricoltura'
  | 'ingegneria'
  | 'cultura'
  | 'commercio';

export interface PredefinedCategory {
  id: CategoryId;
  nome: string;
  descrizione: string;
  colore: string;
  badgeBg: string;
  badgeText: string;
}

export interface CommunityMember {
  id: string;
  nome: string;
  cognome: string;
  dataNascita?: string; // Data di nascita (es. 05/06/1969)
  categoriaId: CategoryId;
  telefono: string;
  email: string;
  indirizzo: string;
  localita: string; // Comune
  cap: string;
  provincia: string; // Sigla (e.g. ME)
  regione: string;
  qualifica: string; // Titolo professionale
  competenze: string[];
  dataInserimento: string; // YYYY-MM-DD
  isNuovo: boolean; // Flag nuovi inseriti
  stato: 'attivo' | 'in verifica' | 'onorario';
  autorizzatoDa: string; // Chi ha autorizzato l'ingresso (es. Irma Donato Alessi)
  dataAutorizzazione?: string;
  note?: string;
  codiceFiscale?: string;
}

export interface AgendaNote {
  id: string;
  titolo: string;
  data: string;
  contenuto: string;
  categoriaRif?: CategoryId;
  priorita: 'normale' | 'alta' | 'urgente';
  completata: boolean;
  obiettiviTavolino?: string[];
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  memberCount: number;
  noteCount: number;
  label: string;
  sizeBytes: number;
  data: {
    members: CommunityMember[];
    notes: AgendaNote[];
    version: string;
    lastSaved: string;
  };
}

export interface ProductSaleItem {
  id: string;
  titolo: string;
  descrizione: string;
  prezzo: number; // Prezzo in EUR
  venditore: string; // Nome venditore o Irma Donato Alessi
  membroId?: string;
  percentualeIrma: number; // e.g. 10 (10%)
  categoriaId: CategoryId;
  disponibile: boolean;
  dataInserimento: string;
  linkPayPalPersonalizzato?: string;
}

export interface SaleTransaction {
  id: string;
  prodottoId: string;
  titoloProdotto: string;
  prezzoTotale: number;
  percentualeIrma: number;
  quotaIrmaIncassata: number;
  quotaVenditore: number;
  venditore: string;
  acquirente: string;
  data: string;
  metodoPagamento: 'PayPal' | 'WhatsApp / Bonifico';
  stato: 'Completato' | 'In Elaborazione';
}

export interface IrmaPaymentSettings {
  paypalLink: string;
  whatsappLink: string;
  percentualePredefinita: number; // Default 10%
  fondatriceNome: string;
}

