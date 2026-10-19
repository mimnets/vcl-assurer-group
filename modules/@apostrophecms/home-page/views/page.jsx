// Assurer home page: a single editable `main` area. Every section (hero,
// slideshow, product cards, contact form) is a widget in that area, so
// editors can add, remove and reorder sections from the page itself.

export default function ({ page, user }, { Extend, Area }) {
  return (
    <Extend
      templateName="layout.jsx"
      main={
        <div className="assurer-home">
          {user && !(page.main?.items?.length) && (
            <p className="assurer-hint">
              This page is empty. Choose <strong>Edit</strong> in the admin bar, then use
              the <strong>+</strong> button to add an Assurer Hero, Slideshow, Product Cards
              or Form section. Or run <code>npm run seed:demo</code> to load the sample layout.
            </p>
          )}
          <Area doc={page} name="main" />
        </div>
      }
    />
  );
}
