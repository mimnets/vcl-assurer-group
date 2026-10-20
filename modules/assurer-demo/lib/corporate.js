// Corporate demo records for the ADR-0003 content model (m1-014).
//
// Everything here is fictional and labelled "Demo": no real company,
// person, figure or address. Records are matched by title (pages by slug),
// including archived ones, and only missing records are created, so a
// re-run changes nothing and never overwrites or resurrects anything an
// editor has changed or archived. Global Content is filled only while its
// footer and contact fields are all empty and it has no unpublished edits.
//
// One product is deliberately left unpublished so draft isolation can be
// checked on the demo category page.

export const DEMO = {
  organizations: [
    {
      key: 'holding',
      title: 'Demo Holding Group (fictional)',
      shortDescription: 'Fictional parent organization used for demonstration. Not a real company.',
      websiteUrl: 'https://example.com/',
      displayOrder: 10
    },
    {
      key: 'textiles',
      title: 'Demo Textiles Ltd (fictional)',
      shortDescription: 'Fictional group company used for demonstration. Not a real company.',
      websiteUrl: 'https://example.org/',
      parent: 'holding',
      displayOrder: 20
    }
  ],
  locations: [
    {
      key: 'head',
      title: 'Demo Head Office',
      city: 'Sample City',
      country: 'Exampleland',
      organization: 'holding',
      showContact: true,
      publicPhone: '+1 555 0100',
      publicEmail: 'office@example.com',
      displayOrder: 10
    },
    {
      key: 'sourcing',
      title: 'Demo Sourcing Office',
      city: 'Testville',
      country: 'Demoland',
      organization: 'textiles',
      displayOrder: 20
    }
  ],
  people: [
    {
      title: 'Alex Example (Demo)',
      jobTitle: 'Demo position',
      organization: 'holding',
      bio: 'Fictional profile used for demonstration. Not a real person.',
      displayOrder: 10
    }
  ],
  division: {
    title: 'Demo Style Division',
    slug: '/demo-style'
  },
  categories: [
    {
      key: 'apparel',
      title: 'Demo Apparel Category',
      slug: '/demo-style/demo-apparel',
      summary: 'Placeholder summary for a demonstration product category.'
    },
    {
      key: 'home',
      title: 'Demo Home Textiles Category',
      slug: '/demo-style/demo-home-textiles',
      summary: 'Placeholder summary for a second demonstration category.'
    }
  ],
  products: [
    {
      title: 'Demo Knitted Top',
      summary: 'Placeholder product description (demo).',
      categories: [ 'apparel' ],
      image: 'home',
      displayOrder: 10
    },
    {
      title: 'Demo Woven Shirt',
      displayTitle: 'Demo Woven Shirt (public name)',
      summary: 'Placeholder product description (demo).',
      categories: [ 'apparel' ],
      image: 'motor',
      displayOrder: 20
    },
    {
      title: 'Demo Cushion Cover',
      summary: 'Placeholder product description (demo).',
      categories: [ 'home' ],
      image: 'business',
      displayOrder: 10
    },
    {
      title: 'Demo Draft Product (unpublished)',
      summary: 'This demo product is a draft and must not appear publicly.',
      categories: [ 'apparel' ],
      displayOrder: 5,
      publish: false
    }
  ],
  global: {
    footerText: 'Demo footer text: fictional placeholder, not company information.',
    contactEmail: 'info@example.com',
    footerLocations: [ 'head' ]
  }
};

const GLOBAL_FIELDS = [
  'footerText', 'copyrightName', 'contactEmail', 'contactPhone', 'contactAddress',
  'footerLocationsIds', 'socialLinks'
];

export async function seedCorporate(self, images) {
  const req = self.apos.task.getReq({ mode: 'draft' });
  const created = [];
  const ref = doc => [ doc ];

  async function ensurePiece(type, input, { publish = true } = {}) {
    const manager = self.apos.modules[type];
    const existing = await manager.find(req, { title: input.title })
      .archived(null)
      .toObject();
    if (existing) {
      return existing;
    }
    const doc = manager.newInstance();
    await manager.convert(req, input, doc);
    const draft = await manager.insert(req, doc);
    if (publish) {
      await manager.publish(req, draft);
    }
    created.push(`${type}: ${input.title}`);
    return draft;
  }

  async function ensurePage(type, parent, input) {
    const existing = await self.apos.page.find(req, { slug: input.slug })
      .archived(null)
      .toObject();
    if (existing) {
      return existing;
    }
    const manager = self.apos.doc.getManager(type);
    const page = manager.newInstance();
    await manager.convert(req, {
      ...input,
      type
    }, page);
    const draft = await self.apos.page.insert(req, parent._id, 'lastChild', page);
    await self.apos.page.publish(req, draft);
    created.push(`page: ${input.slug}`);
    return draft;
  }

  const orgs = {};
  for (const {
    key, parent, ...input
  } of DEMO.organizations) {
    orgs[key] = await ensurePiece('assurer-organization', {
      ...input,
      _parentOrganization: parent ? ref(orgs[parent]) : []
    });
  }

  const locations = {};
  for (const {
    key, organization, ...input
  } of DEMO.locations) {
    locations[key] = await ensurePiece('assurer-location', {
      ...input,
      _organization: ref(orgs[organization])
    });
  }

  for (const { organization, ...input } of DEMO.people) {
    await ensurePiece('assurer-person', {
      ...input,
      _organization: ref(orgs[organization])
    });
  }

  const home = await self.apos.page.find(req, { level: 0 }).toObject();
  const division = await ensurePage('assurer-division-page', home, {
    ...DEMO.division,
    _organizations: [ orgs.textiles ]
  });

  const categories = {};
  for (const { key, ...input } of DEMO.categories) {
    categories[key] = await ensurePage('assurer-product-category-page', division, input);
  }

  for (const {
    categories: keys, image, publish, ...input
  } of DEMO.products) {
    await ensurePiece('assurer-product', {
      ...input,
      _categories: keys.map(key => categories[key]),
      _image: image ? ref(images[image]) : []
    }, { publish: publish !== false });
  }

  const global = await self.apos.global.findGlobal(req);
  const untouched = GLOBAL_FIELDS.every(name => {
    const value = global[name];
    return value == null || value === '' || (Array.isArray(value) && !value.length);
  });
  if (untouched && !global.modified) {
    const { footerLocations, ...fields } = DEMO.global;
    await self.apos.global.convert(req, {
      ...fields,
      _footerLocations: footerLocations.map(key => locations[key])
    }, global, { presentFieldsOnly: true });
    await self.apos.global.update(req, global);
    await self.apos.global.publish(req, global);
    created.push('global: demo footer and contact fields');
  }

  return created;
}
