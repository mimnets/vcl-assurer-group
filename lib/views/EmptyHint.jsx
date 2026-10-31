// Shown in place of an empty listing, to logged-in users only, so an editor
// knows why a section is blank. Visitors get nothing.
export default function EmptyHint({ user, text }) {
  return user ? <p className="assurer-hint">{text}</p> : null;
}
