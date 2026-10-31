# Design tokens and brand swap guide

| | |
|---|---|
| **Task** | m1-020 (CA-4 scaffolding) · m1-021 (brand values) |
| **Date** | 2026-10-31 |
| **Status** | **Brand values from the live site, pending the owner's confirmation** (m1-021). The owner directed the agent to take colours, font, logo and favicon from the public pages of www.assurerworld.com (D-CONTENT-12). No brand guide or vector logo yet. The site's orange is darkened for text to pass WCAG 2.2 AA (§3). |
| **Source** | `modules/asset/ui/src/scss/_tokens.scss` · `_fonts.scss` · `public/fonts/roboto/` · `public/images/brand/` |
| **Related** | [Editorial and design requirements](./editorial-and-design-requirements.md) §4–§7 · [Implementation plan](./implementation-plan-and-risks.md) (CA-4) |

## 1. How the theme is set up

- All colour, type, spacing and shape values live in `_tokens.scss` as CSS custom properties on
  `:root`. Project styles (`_assurer.scss`, `_corporate.scss`, `_sections.scss`, `_type.scss`,
  `_layout.scss`) use only these properties. Two exceptions stay literal on purpose: the gallery
  lightbox (a dark media viewer) and the slideshow caption gradient (text over photographs).
- Breakpoints are Sass variables (`$bp-tablet: 768px`, `$bp-desktop: 1024px`), because media
  queries cannot read custom properties.
- The site name or logo is drawn in one place: `BrandMark` in `views/layout.jsx`. Owner's rule
  (m1-021): the logo alone when there is one, otherwise the text name, never both. The image's
  alternative text "Assurer World" names the home link. Set `LOGO` to `null` for the text name.
  Favicon links are in `FaviconLinks` in the same file.
- Starter-kit leftovers not routed through tokens: `$color-*` in `_settings.scss`, used only by
  the unused `.bp-button` class in `_type.scss`.

## 2. Swapping in the brand (D-CONTENT-12)

| Supplied asset | Change | Token or file |
|---|---|---|
| Primary colour | Header text, hero background, stats values, skip link | `--assurer-color-primary`, `--assurer-color-on-primary`, `--assurer-overlay-dark` and `--assurer-shadow-raised` (both use the primary's RGB) |
| Accent colour | Buttons, card links, badges, focus ring | `--assurer-color-accent`, `--assurer-color-on-accent`, `--assurer-color-focus` |
| Neutrals | Text, muted text, surfaces, borders | `--assurer-color-text`, `-text-muted`, `-surface`, `-surface-alt`, `-border`, `-border-subtle`, `-border-strong` |
| Link colours | Links in content | `--assurer-color-link`, `--assurer-color-link-visited` |
| Body font (self-hosted files) | `@font-face` in `_fonts.scss`, files under `public/fonts/` (absolute `/fonts/…` URLs: the dev build does not rewrite relative `url()` in Sass partials) | `--assurer-font-body`. Global Styles no longer has a body font control (m1-021) |
| Heading font | Define the token (headings inherit the body font until then) | `--assurer-font-heading` |
| Vector logo | Point `LOGO` at the SVG; keep the link to `/` and the alternative text | `views/layout.jsx` |
| Favicon | Replace the three PNGs, or derive them from the vector logo | `public/images/brand/`, `FaviconLinks` |

After any swap, re-check every pair in §3 and update the table.

### Brand values in use (m1-021)

Taken from the public pages of www.assurerworld.com on 2026-10-31 (computed styles, read-only), at
the owner's direction. The owner still confirms them as the official brand.

| Token | Value | Source on the live site |
|---|---|---|
| Primary | `#212d68` | Dark navy section background |
| Accent | `#a85a00` | Menu orange `#db740c` darkened: the original is 3.22:1 on white and fails AA for text and under white text |
| Text / muted | `#333` / `#5d5d5d` | Body text / secondary text |
| Surface alt | `#f5f5f5` | Light grey section background |
| Link / visited | `#1e44a4` / `#434b74` | Blue headings / dark blue-grey heading |
| Selection | `#ff9c38` | Orange band background (background only) |
| Body font | Roboto 400, 500, 700 (latin) | The site's Elementor typography; self-hosted from `@fontsource/roboto` 5.3.0, SIL OFL 1.1 (`public/fonts/roboto/OFL.txt`) |
| Logo | `assurer-logo.png`, 168 × 168, shown at 56 px | `assure-logo4.png` (300 × 300, textured) resized; the owner chose it over the flat "AW Final Logo.png" in session |
| Favicon | `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` | `cropped-assure-center-*` PNGs, unchanged |

Not taken: the Elementor kit's global colours (`#6EC1E4`, `#61CE70`, …) and "Roboto Slab", which
are Elementor defaults the live site does not use. Other oranges on the site (`#f07901`,
`#e07a00`) were not given tokens. The flat logo file "AW Final Logo.png" (navy `#434b74`, orange
`#e19e59`) was tried and set aside by the owner.

## 3. Contrast of the brand palette (WCAG 2.2 AA)

Computed by the agent on 2026-10-31 for the m1-021 values (relative luminance formula). Text
needs 4.5:1; large text and UI components need 3:1.

| Pair | Ratio | Result |
|---|---|---|
| Text `#333` on surface `#fff` | 12.63 | PASS |
| Text on surface-alt `#f5f5f5` | 11.59 | PASS |
| Primary `#212d68` on surface | 12.81 | PASS |
| Primary on surface-alt | 11.75 | PASS |
| White on primary (hero, skip link) | 12.81 | PASS |
| Accent `#a85a00` on surface (card links, outline button) | 5.09 | PASS |
| White on accent (primary button, submit) | 5.09 | PASS |
| Accent on surface-alt (card badge) | 4.67 | PASS |
| Muted text `#5d5d5d` on surface (footer, breadcrumbs) | 6.58 | PASS |
| Link `#1e44a4` on surface | 8.68 | PASS |
| Visited link `#434b74` on surface | 8.41 | PASS |
| Danger `#b02a37` on surface (form errors) | 6.50 | PASS |
| Notice text `#664d03` on notice `#fff3cd` | 7.21 | PASS |
| Focus ring (accent) on surface | 5.09 | PASS (3:1) |
| Strong border `#6b7785` on surface (form fields, Menu button, slideshow dots) | 4.56 | PASS (3:1) |
| Text on selection `#ff9c38` | 6.06 | PASS |

The m1-020 placeholder table is in that task's report and in Git history.

## 4. Type and spacing scale

- Headings: modular scale 1.25 in `em`, so they follow the body size that Global Styles sets
  per breakpoint. H1 2.441, H2 1.953, H3 1.563, H4 1.25, small 0.875.
- Spacing: 4 px base, `--assurer-space-1` … `-8` = 4, 8, 12, 16, 24, 32, 48, 64 px. The gap
  between sections is `--assurer-space-section` (48 px). Other paddings are still literal
  pixel values; move them onto the scale when the brand layout is set.
