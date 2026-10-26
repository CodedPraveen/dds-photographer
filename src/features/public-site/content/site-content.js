const portfolioSources = [
  {
    title: "Portrait study",
    mediaUrl: "/placeholders/portfolio-01.svg",
    altText: "Warm-toned abstract portrait study",
    width: 900,
    height: 1200,
  },
  {
    title: "Landscape study",
    mediaUrl: "/placeholders/portfolio-02.svg",
    altText: "Mist-toned abstract landscape study",
    width: 1200,
    height: 800,
  },
  {
    title: "Architectural study",
    mediaUrl: "/placeholders/portfolio-03.svg",
    altText: "Neutral geometric architectural study",
    width: 1000,
    height: 1000,
  },
  {
    title: "Editorial study",
    mediaUrl: "/placeholders/portfolio-04.svg",
    altText: "Deep green abstract editorial study",
    width: 900,
    height: 1350,
  },
  {
    title: "Event study",
    mediaUrl: "/placeholders/portfolio-05.svg",
    altText: "Warm-light abstract event study",
    width: 1200,
    height: 900,
  },
  {
    title: "Commercial study",
    mediaUrl: "/placeholders/portfolio-06.svg",
    altText: "Cool-toned abstract commercial study",
    width: 1000,
    height: 1250,
  },
];

const portfolio = Array.from({ length: 20 }, (_, index) => {
  const source = portfolioSources[index % portfolioSources.length];
  return {
    ...source,
    id: `development-${String(index + 1).padStart(2, "0")}`,
    title: `${source.title} ${String(index + 1).padStart(2, "0")}`,
    altText: `${source.altText}, development frame ${index + 1}`,
    mediaType: "IMAGE",
    sortOrder: index + 1,
    isActive: true,
  };
});

export const publicSiteContent = Object.freeze({
  isPlaceholder: true,
  navigation: [
    { label: "Home", href: "/#home" },
    { label: "Portfolio", href: "/#portfolio" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    image: "/placeholders/hero.svg",
    imageAlt: "Abstract mountain landscape used as temporary hero photography",
  },
  about: {
    eyebrow: "About",
    title: "Photography that keeps the story in focus.",
    body: [
      "Temporary copy: a calm, considered photography experience for moments, people, and stories worth preserving.",
      "Final biography, studio approach, and approved imagery will replace this preview content without changing the section layout.",
    ],
  },
  portfolio,
  services: [
    {
      title: "Wedding Photography",
      description:
        "Temporary description for considered coverage of a wedding day and its defining moments.",
      mediaUrl: "/placeholders/portfolio-05.svg",
      altText: "Warm abstract visual representing wedding photography",
    },
    {
      title: "Portrait Photography",
      description:
        "Temporary description for individual, couple, family, and editorial portrait sessions.",
      mediaUrl: "/placeholders/portfolio-01.svg",
      altText: "Warm abstract visual representing portrait photography",
    },
    {
      title: "Event Photography",
      description:
        "Temporary description for calm, observant coverage of personal and professional gatherings.",
      mediaUrl: "/placeholders/portfolio-02.svg",
      altText: "Atmospheric abstract visual representing event photography",
    },
    {
      title: "Commercial Photography",
      description:
        "Temporary description for visual work shaped around a brand, space, product, or campaign.",
      mediaUrl: "/placeholders/portfolio-06.svg",
      altText: "Cool abstract visual representing commercial photography",
    },
  ],
  contact: {
    eyebrow: "Contact",
    title: "Let's create something memorable.",
    description:
      "The contact details below are temporary and will be replaced with verified business information.",
    email: { label: "hello@example.com", href: "mailto:hello@example.com" },
    phone: { label: "+91 00000 00000", href: "tel:+910000000000" },
    location: "Temporary location",
  },
  socialLinks: [
    { label: "Instagram", href: "https://example.com" },
    { label: "Facebook", href: "https://example.com" },
    { label: "Behance", href: "https://example.com" },
    { label: "Pinterest", href: "https://example.com" },
  ],
});
