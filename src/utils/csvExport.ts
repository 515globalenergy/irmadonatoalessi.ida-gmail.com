import { CommunityMember } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';

function escapeCSV(value: string | number | boolean | undefined | null): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportMembersToCSV(members: CommunityMember[], filename?: string): void {
  const categoryMap = new Map(CATEGORIE_PREDEFINITE.map((c) => [c.id, c.nome]));

  const headers = [
    'ID',
    'Nome',
    'Cognome',
    'Categoria Predefinita',
    'Qualifica Professionale',
    'Numero Telefonico',
    'Indirizzo Email',
    'Indirizzo Civico',
    'Località (Comune)',
    'CAP',
    'Provincia',
    'Regione',
    'Competenze Chiave',
    'Data Inserimento Community',
    'Nuovo Inserito',
    'Stato Anagrafico',
    'Autorizzazione Ingresso',
    'Codice Fiscale',
    'Note Operative',
  ];

  const rows = members.map((m) => [
    m.id,
    m.nome,
    m.cognome,
    categoryMap.get(m.categoriaId) || m.categoriaId,
    m.qualifica,
    m.telefono,
    m.email,
    m.indirizzo,
    m.localita,
    m.cap,
    m.provincia,
    m.regione,
    m.competenze.join('; '),
    m.dataInserimento,
    m.isNuovo ? 'SÌ' : 'NO',
    m.stato.toUpperCase(),
    m.autorizzatoDa || 'Irma Donato Alessi (Fondatrice)',
    m.codiceFiscale || '',
    m.note || '',
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel
    [headers.map(escapeCSV).join(';')]
      .concat(rows.map((row) => row.map(escapeCSV).join(';')))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `Tavolino_Competenze_Italia_Community_${dateStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToMembers(csvText: string): Partial<CommunityMember>[] {
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV respecting quotes
  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let insideQuotes = false;
    let field = '';
    const delimiter = line.includes(';') ? ';' : ',';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        row.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    return row.map((f) => f.replace(/^"|"$/g, '').trim());
  };

  const parsedMembers: Partial<CommunityMember>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length >= 7 && (cols[1] || cols[2])) {
      parsedMembers.push({
        id: cols[0] || `tc-${Date.now().toString(36)}-${i}`,
        nome: cols[1] || 'Nominativo',
        cognome: cols[2] || '',
        qualifica: cols[4] || 'Professionista',
        telefono: cols[5] || '',
        email: cols[6] || '',
        indirizzo: cols[7] || '',
        localita: cols[8] || 'Italia',
        cap: cols[9] || '00100',
        provincia: cols[10] || 'IT',
        regione: cols[11] || 'Italia',
        competenze: cols[12] ? cols[12].split(/;|,/).map((s) => s.trim()) : [],
        dataInserimento: cols[13] || new Date().toISOString().split('T')[0],
        isNuovo: cols[14]?.toUpperCase() === 'SÌ' || cols[14]?.toUpperCase() === 'SI' || cols[14]?.toUpperCase() === 'YES',
        stato: 'attivo',
        autorizzatoDa: cols[16] || 'Irma Donato Alessi (Fondatrice)',
        note: cols[18] || '',
      });
    }
  }

  return parsedMembers;
}
