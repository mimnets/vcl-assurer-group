export default function ({ widget }, { Area }) {
  return (
    <section className="assurer-products" id={widget.anchor || undefined}>
      <div className="assurer-products__intro">
        <Area doc={widget} name="intro" />
      </div>
      <div className={`assurer-products__grid assurer-products__grid--cols-${widget.columns || '3'}`}>
        <Area doc={widget} name="cards" />
      </div>
    </section>
  );
}
