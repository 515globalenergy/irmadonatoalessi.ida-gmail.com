import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommunityMember, AgendaNote } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';

export function exportDatabaseToPDF(
  members: CommunityMember[],
  notes: AgendaNote[] = [],
  includeNotes: boolean = true
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const categoryMap = new Map(CATEGORIE_PREDEFINITE.map((c) => [c.id, c.nome]));
  const oggi = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalMembers = members.length;
  const newMembersCount = members.filter((m) => m.isNuovo).length;

  // Header Box - Italian Institutional & Notebook Elegance
  doc.setFillColor(30, 41, 59); // Slate-900
  doc.rect(14, 12, 269, 24, 'F');

  // Tricolor Italian Accent Stripe
  doc.setFillColor(0, 146, 70); // Green
  doc.rect(14, 12, 10, 24, 'F');
  doc.setFillColor(241, 242, 241); // White
  doc.rect(24, 12, 10, 24, 'F');
  doc.setFillColor(206, 43, 55); // Red
  doc.rect(34, 12, 10, 24, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAVOLINO DELLE COMPETENZE · CREATO DA IRMA DONATO ALESSI', 52, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Community creata da Irma Donato Alessi · Foglio Mastro Ufficiale & Registro Vendite',
    52,
    29
  );

  // Metadata Panel
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 40, 269, 14, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(`Data Estratto: `, 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`${oggi}`, 40, 48);

  doc.setFont('helvetica', 'bold');
  doc.text(`Professionisti Archiviati: `, 90, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalMembers}`, 130, 48);

  doc.setFont('helvetica', 'bold');
  doc.text(`Nuovi Inseriti Community: `, 160, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`${newMembersCount}`, 203, 48);

  doc.setFont('helvetica', 'bold');
  doc.text(`Stato Backup Cloud: `, 220, 48);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text(`Sincronizzato`, 253, 48);

  // Community Members Table Data
  const tableRows = members.map((m, idx) => [
    (idx + 1).toString(),
    `${m.cognome.toUpperCase()} ${m.nome}${m.isNuovo ? ' ★' : ''}`,
    categoryMap.get(m.categoriaId) || m.categoriaId,
    m.qualifica,
    `${m.localita} (${m.provincia})`,
    m.telefono,
    m.autorizzatoDa || 'Irma Donato Alessi',
    m.dataInserimento,
  ]);

  autoTable(doc, {
    startY: 58,
    head: [
      [
        'N°',
        'Nominativo Membro',
        'Categoria Predefinita',
        'Qualifica / Titolo',
        'Località',
        'Recapito Tel.',
        'Autorizzato da',
        'Data Inserimento',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 46 },
      4: { cellWidth: 32 },
      5: { cellWidth: 28 },
      6: { cellWidth: 46, fontStyle: 'bold' },
      7: { cellWidth: 28, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageNumber = data.pageNumber;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Tavolino delle Competenze Italia · Quaderno Digitale di Lavoro e Monitoraggio Territoriale',
        14,
        202
      );
      doc.text(
        `Pagina ${pageNumber}`,
        268,
        202,
        { align: 'right' }
      );
    },
  });

  // If there are agenda work notes, append a second section
  if (includeNotes && notes.length > 0) {
    doc.addPage();

    // Notes Section Header
    doc.setFillColor(30, 41, 59);
    doc.rect(14, 12, 269, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('AGENDA DI LAVORO & VERBALI DI SEDUTA DEL TAVOLINO', 20, 22);

    const noteRows = notes.map((n) => [
      n.data,
      n.titolo,
      n.priorita.toUpperCase(),
      n.completata ? 'COMPLETATO' : 'IN CORSO',
      n.contenuto,
      n.obiettiviTavolino ? n.obiettiviTavolino.join('; ') : '-',
    ]);

    autoTable(doc, {
      startY: 34,
      head: [
        [
          'Data',
          'Titolo Seduta / Attività',
          'Priorità',
          'Stato',
          'Note & Sintesi Delibera',
          'Obiettivi Chiave & Competenze Coinvolte',
        ],
      ],
      body: noteRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 85 },
        5: { cellWidth: 70 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  const dateFile = new Date().toISOString().split('T')[0];
  doc.save(`Tavolino_Competenze_Italia_Registro_${dateFile}.pdf`);
}

export function exportSingleMemberPDF(member: CommunityMember): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const categoryMap = new Map(CATEGORIE_PREDEFINITE.map((c) => [c.id, c.nome]));
  const catName = categoryMap.get(member.categoriaId) || member.categoriaId;

  // Header Box
  doc.setFillColor(30, 41, 59);
  doc.rect(14, 14, 182, 28, 'F');

  // Tricolor stripe
  doc.setFillColor(0, 146, 70);
  doc.rect(14, 14, 6, 28, 'F');
  doc.setFillColor(241, 242, 241);
  doc.rect(20, 14, 6, 28, 'F');
  doc.setFillColor(206, 43, 55);
  doc.rect(26, 14, 6, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAVOLINO DELLE COMPETENZE ITALIA', 38, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Scheda Individuale di Accreditamento Community', 38, 32);

  // Main Card
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 48, 182, 195, 'FD');

  // Title: Member Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${member.nome} ${member.cognome}`, 22, 62);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text(member.qualifica, 22, 70);

  // Badge Category
  doc.setFillColor(241, 245, 249);
  doc.rect(22, 76, 166, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`CATEGORIA: ${catName.toUpperCase()}`, 26, 81.5);

  // Contact Table
  const contactDetails = [
    ['Recapito Telefonico:', member.telefono],
    ['Indirizzo Posta Elettronica:', member.email],
    ['Indirizzo Civico:', member.indirizzo],
    ['Località & CAP:', `${member.cap} ${member.localita} (${member.provincia})`],
    ['Regione:', member.regione],
    ['Data Inserimento nella Community:', member.dataInserimento],
    ['Autorizzazione all’Ingresso:', member.autorizzatoDa || 'Irma Donato Alessi (Fondatrice)'],
    ['Stato Istruttorio:', member.stato.toUpperCase()],
    ['Codice Fiscale:', member.codiceFiscale || 'Disponibile in atti'],
  ];

  autoTable(doc, {
    startY: 90,
    body: contactDetails,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2.2,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 106, textColor: [15, 23, 42] },
    },
    margin: { left: 22, right: 22 },
  });

  // Skills
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPETENZE CERTIFICATE E AMBITI OPERATIVI:', 22, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const skillsText = member.competenze.map((c) => `• ${c}`).join('\n');
  doc.text(skillsText, 24, finalY + 7);

  // Notes
  const notesY = finalY + 7 + member.competenze.length * 6 + 6;
  if (member.note) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('NOTE OPERATIVE E COLLABORAZIONI IN ATTO:', 22, notesY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(member.note, 166);
    doc.text(splitNotes, 22, notesY + 6);
  }

  // Official Stamp Box
  doc.setDrawColor(148, 163, 184);
  doc.rect(22, 212, 70, 24);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('TIMBRO COMUNITÀ & VISTO', 25, 218);
  doc.text('Tavolino Competenze Irma Donato Alessi', 25, 230);

  doc.setDrawColor(148, 163, 184);
  doc.rect(118, 212, 70, 24);
  doc.text('LA FONDATRICE: IRMA DONATO ALESSI', 121, 218);

  const cleanName = `${member.cognome}_${member.nome}`.replace(/\s+/g, '_');
  doc.save(`Scheda_Competenze_${cleanName}.pdf`);
}
