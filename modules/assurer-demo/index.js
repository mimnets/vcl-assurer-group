// Loads clearly labelled demonstration content for Milestone 0:
//
//   node app assurer-demo:seed           (skips if the home page has content)
//   node app assurer-demo:seed --force   (replaces the home page content)
//
// and fictional records for the corporate content model (m1-014, ADR-0003):
//
//   node app assurer-demo:seed-corporate                  (temporary SQLite only)
//   node app assurer-demo:seed-corporate --dev-database   (another dev database)
//
// The corporate seed refuses to run in production, adds only missing records
// and never edits existing ones (lib/corporate.js, lib/guard.js).
//
// Everything goes through Apostrophe's own `convert` (the same sanitization
// path the editor UI uses) and is published through the normal draft/publish
// workflow. It never touches users or any external system.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedCorporate } from './lib/corporate.js';
import { seedRefuseReason } from './lib/guard.js';

const imagesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../demo-content/images'
);
const filesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../demo-content/files'
);

const IMAGES = {
  hero: [ 'hero-skyline.png', 'DEMO – Hero background', 'Abstract blue gradient placeholder' ],
  slide1: [ 'slide-1-team.png', 'DEMO – Slide 1', 'Placeholder slide one' ],
  slide2: [ 'slide-2-office.png', 'DEMO – Slide 2', 'Placeholder slide two' ],
  slide3: [ 'slide-3-city.png', 'DEMO – Slide 3', 'Placeholder slide three' ],
  home: [ 'product-home.png', 'DEMO – Home Cover', 'Placeholder product image: home cover' ],
  motor: [ 'product-motor.png', 'DEMO – Motor Cover', 'Placeholder product image: motor cover' ],
  business: [ 'product-business.png', 'DEMO – Business Cover', 'Placeholder product image: business cover' ]
};

const FORM_TITLE = 'DEMO – Contact Assurer';

// Refuse before Apostrophe connects to the database or runs migrations.
if (process.argv.includes('assurer-demo:seed-corporate')) {
  assertCorporateSeedAllowed(process.argv);
}

function assertCorporateSeedAllowed(argv) {
  const reason = seedRefuseReason(process.env, argv);
  if (reason) {
    throw new Error(`Refusing to run assurer-demo:seed-corporate: ${reason}.`);
  }
}

export default {
  tasks(self) {
    return {
      seed: {
        usage: 'Load Milestone 0 demonstration content onto the home page.\n' +
          'Usage: node app assurer-demo:seed [--force]',
        task: (argv) => self.seed(argv)
      },
      'seed-corporate': {
        usage: 'Add fictional demo products, organizations, people, locations, a division ' +
          'page, category pages, a demo file and a page of section widgets (ADR-0003, ' +
          'm1-015). Adds missing records only.\n' +
          'Usage: node app assurer-demo:seed-corporate [--dev-database]',
        task: () => self.seedCorporate()
      }
    };
  },
  methods(self) {
    const area = (items) => ({
      metaType: 'area',
      items: items.map(item => ({
        _id: self.apos.util.generateId(),
        metaType: 'widget',
        ...item
      }))
    });
    const richText = (content) => ({
      type: '@apostrophecms/rich-text',
      content
    });

    return {
      async seedCorporate() {
        assertCorporateSeedAllowed(process.argv);
        const req = self.apos.task.getReq({ mode: 'draft' });
        const images = {};
        for (const key of [ 'home', 'motor', 'business' ]) {
          const [ file, title, alt ] = IMAGES[key];
          images[key] = await self.ensureImage(req, file, title, alt);
        }
        const filePath = file => path.join(filesDir, file);
        const created = await seedCorporate(self, images, filePath);
        self.apos.util.log(created.length
          ? `Corporate demo records created: ${created.length}\n  ${created.join('\n  ')}`
          : 'Corporate demo records already present; nothing changed.');
      },

      async seed(argv) {
        const req = self.apos.task.getReq({ mode: 'draft' });
        const home = await self.apos.page.find(req, { level: 0 }).toObject();
        if (!home) {
          throw new Error('Home page not found.');
        }
        if (home.main?.items?.length && !argv.force) {
          self.apos.util.log('Home page already has content; nothing changed. Use --force to replace it.');
          return;
        }

        const images = {};
        for (const [ key, [ file, title, alt ] ] of Object.entries(IMAGES)) {
          images[key] = await self.ensureImage(req, file, title, alt);
        }
        const form = await self.ensureForm(req);

        const card = (image, title, text) => ({
          type: 'assurer-product-card',
          _image: [ image ],
          badge: 'Demo',
          title,
          body: area([ richText(`<p>${text}</p>`) ]),
          hasLink: false
        });

        const input = {
          main: area([
            {
              type: 'assurer-hero',
              eyebrow: 'Demonstration content',
              overlay: 'dark',
              _backgroundImage: [ images.hero ],
              content: area([
                richText(
                  '<h1>Protection you can rely on</h1>' +
                  '<p>Placeholder headline and text for the Assurer World proof of concept. ' +
                  'Click this text in edit mode to change it.</p>'
                )
              ]),
              buttons: [
                {
                  linkText: 'View products',
                  linkType: 'url',
                  linkUrl: '#products',
                  style: 'primary'
                }
              ]
            },
            {
              type: 'assurer-slideshow',
              autoplay: true,
              interval: 6,
              slides: [
                {
                  _id: self.apos.util.generateId(),
                  _image: [ images.slide1 ],
                  caption: 'Demo slide 1 — placeholder caption'
                },
                {
                  _id: self.apos.util.generateId(),
                  _image: [ images.slide2 ],
                  caption: 'Demo slide 2 — placeholder caption'
                },
                {
                  _id: self.apos.util.generateId(),
                  _image: [ images.slide3 ],
                  caption: 'Demo slide 3 — placeholder caption'
                }
              ]
            },
            {
              type: 'assurer-product-grid',
              anchor: 'products',
              columns: '3',
              intro: area([
                richText(
                  '<h2>Our products (demo)</h2>' +
                  '<p>Sample product cards. Names and descriptions are placeholders.</p>'
                )
              ]),
              cards: area([
                card(images.home, 'Home Cover (Demo)', 'Placeholder description for a home insurance product.'),
                card(images.motor, 'Motor Cover (Demo)', 'Placeholder description for a motor insurance product.'),
                card(images.business, 'Business Cover (Demo)', 'Placeholder description for a business insurance product.')
              ])
            },
            richText('<h2>Contact us (demo form)</h2><p>Submissions are stored locally only.</p>'),
            {
              type: '@apostrophecms/form',
              _form: [ form ]
            }
          ])
        };

        await self.apos.doc.getManager(home.type)
          .convert(req, input, home, { presentFieldsOnly: true });
        await self.apos.page.update(req, home);
        await self.apos.page.publish(req, home);
        self.apos.util.log('Demo content loaded and published on the home page.');
      },

      async ensureImage(req, file, title, alt) {
        const existing = await self.apos.image.find(req, { title }).toObject();
        if (existing) {
          return existing;
        }
        const attachment = await self.apos.attachment.insert(req, {
          name: file,
          path: path.join(imagesDir, file)
        });
        // Image pieces autopublish, so the published version is created too.
        return self.apos.image.insert(req, {
          title,
          alt,
          attachment
        });
      },

      async ensureForm(req) {
        const forms = self.apos.modules['@apostrophecms/form'];
        const existing = await forms.find(req, { title: FORM_TITLE }).toObject();
        if (existing) {
          return existing;
        }
        const field = (type, fieldLabel, fieldName, extra = {}) => ({
          type: `@apostrophecms/form-${type}-field`,
          fieldLabel,
          fieldName,
          ...extra
        });
        const input = {
          title: FORM_TITLE,
          submitLabel: 'Send message',
          thankYouHeading: 'Thank you (demo)',
          thankYouBody: area([
            richText('<p>This is a demonstration form. Your message was stored locally and no one will reply.</p>')
          ]),
          contents: area([
            field('text', 'Full name', 'fullname', { required: true }),
            field('text', 'Email address', 'email', {
              required: true,
              inputType: 'email'
            }),
            field('text', 'Company', 'company'),
            field('select', 'Interested in', 'interest', {
              choices: [
                {
                  label: 'Home Cover (Demo)',
                  value: 'home'
                },
                {
                  label: 'Motor Cover (Demo)',
                  value: 'motor'
                },
                {
                  label: 'Business Cover (Demo)',
                  value: 'business'
                }
              ]
            }),
            field('textarea', 'Message', 'message', { required: true }),
            field('boolean', 'I understand this is a demonstration form', 'consent', { required: true })
          ])
        };
        const doc = forms.newInstance();
        await forms.convert(req, input, doc);
        const draft = await forms.insert(req, doc);
        await forms.publish(req, draft);
        return draft;
      }
    };
  }
};
