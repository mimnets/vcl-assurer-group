// Display helpers for downloadable files (m1-015, `assurer-downloads`). The
// type and size come from the stored attachment, never from editor input.

// "PDF", "DOCX"... or "" when unknown.
export function fileType(attachment) {
  const ext = String(attachment?.extension || '').replace(/[^a-z0-9]/gi, '');
  return ext.toUpperCase();
}

// Human-readable size in binary units: "820 B", "14 KB", "1.2 MB".
export function fileSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) {
    return '';
  }
  if (n < 1024) {
    return `${n} B`;
  }
  const units = [ 'KB', 'MB', 'GB' ];
  let value = n / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return `${rounded} ${units[unit]}`;
}
