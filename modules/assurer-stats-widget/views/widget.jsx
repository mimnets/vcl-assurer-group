// Key figures: value, label and an optional source or "as of" note.

export default function ({ widget }, { Area }) {
  const items = widget.items || [];
  return (
    <section className="assurer-section assurer-stats" id={widget.anchor || undefined}>
      <div className="assurer-section__intro">
        <Area doc={widget} name="intro" />
      </div>
      {items.length > 0 && (
        <ul className="assurer-stats__list">
          {items.map(item => (
            <li className="assurer-stats__item">
              <p className="assurer-stats__value">{item.value}</p>
              <p className="assurer-stats__label">{item.label}</p>
              {item.note && <p className="assurer-stats__note">{item.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
