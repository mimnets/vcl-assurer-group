// Shared "Display order" field for the corporate piece types (m1-014).
// Lists sort by this number (lowest first), then by title. Ties are normal:
// equal numbers fall back to alphabetical order.

export const displayOrderField = {
  type: 'integer',
  label: 'Display order',
  help: 'Lower numbers are listed first. Records with the same number are listed alphabetically.',
  def: 100,
  min: 0,
  max: 9999
};

export const displayOrderSort = {
  displayOrder: 1,
  title: 1
};

// Sort already-loaded records the same way (relationship results keep the
// order in which they were picked, reverse relationships have none).
export function byDisplayOrder(a, b) {
  const order = (a.displayOrder ?? 100) - (b.displayOrder ?? 100);
  return order || String(a.title || '').localeCompare(String(b.title || ''));
}
