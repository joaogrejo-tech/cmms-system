import * as XLSX from 'xlsx';

/** Converte um array de objetos em CSV e dispara o download no navegador. */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = String(value ?? '');
    return /[",\n;]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(';')),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

/** Converte um array de objetos em uma planilha .xlsx e dispara o download. */
export function exportToExcel(filename: string, rows: Record<string, unknown>[], sheetName = 'Relatório') {
  if (rows.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/** Abre uma janela de impressão do navegador com uma tabela formatada (usada como exportação em PDF). */
export function exportToPdf(title: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const style = `
    body { font-family: Arial, sans-serif; padding: 24px; color: #0F172A; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    p { color: #64748B; font-size: 12px; margin-top: 0; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #E2E8F0; padding: 6px 8px; text-align: left; }
    th { background: #F1F5F9; text-transform: uppercase; font-size: 10px; }
    tr:nth-child(even) { background: #F8FAFC; }
  `;

  const tableRows = rows
    .map((row) => `<tr>${headers.map((h) => `<td>${String(row[h] ?? '')}</td>`).join('')}</tr>`)
    .join('');

  printWindow.document.write(`
    <html>
      <head><title>${title}</title><style>${style}</style></head>
      <body>
        <h1>${title}</h1>
        <p>Gerado em ${new Date().toLocaleString('pt-BR')} · CMMS Cervejaria</p>
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
