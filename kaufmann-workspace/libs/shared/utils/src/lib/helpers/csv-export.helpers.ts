/**
 * Builds a CSV string from headers and rows, then triggers a browser download.
 * Includes BOM for Excel compatibility with special characters.
 */
export function downloadCsv(headers: string[], rows: string[][], filename: string): void {
  const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    ...rows.map(r => r.map(escape).join(',')),
  ].join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
