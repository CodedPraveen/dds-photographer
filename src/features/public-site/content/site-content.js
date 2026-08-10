export const publicSiteContent = Object.freeze({
  isPlaceholder: true,
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "Temporary preview · DDS Photographer",
    title: "Moments worth remembering.",
    description: "Wedding · Portrait · Events",
    image: "/placeholders/hero.svg",
    imageAlt:
      "Temporary abstract hero image standing in for approved studio photography",
  },
  about: {
    eyebrow: "About",
    title: "Photography that keeps the story in focus.",
    body: [
      "Temporary copy: a calm, considered photography experience for moments, people, and stories worth preserving.",
      "Final biography, studio approach, and approved imagery will replace this preview content without changing the section layout.",
    ],
  },
  portfolio: [
    {
      id: "temporary-01",
      title: "Portrait study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-01.svg",
      altText: "Temporary warm-toned abstract portrait placeholder",
      sortOrder: 1,
      isActive: true,
      layout: "portrait",
    },
    {
      id: "temporary-02",
      title: "Landscape study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-02.svg",
      altText: "Temporary mist-toned abstract landscape placeholder",
      sortOrder: 2,
      isActive: true,
      layout: "landscape",
    },
    {
      id: "temporary-03",
      title: "Architectural study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-03.svg",
      altText: "Temporary neutral architectural placeholder",
      sortOrder: 3,
      isActive: true,
      layout: "square",
    },
    {
      id: "temporary-04",
      title: "Editorial study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-04.svg",
      altText: "Temporary deep green editorial placeholder",
      sortOrder: 4,
      isActive: true,
      layout: "tall",
    },
    {
      id: "temporary-05",
      title: "Event study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-05.svg",
      altText: "Temporary warm-light event placeholder",
      sortOrder: 5,
      isActive: true,
      layout: "wide",
    },
    {
      id: "temporary-06",
      title: "Commercial study",
      mediaType: "IMAGE",
      mediaUrl: "/placeholders/portfolio-06.svg",
      altText: "Temporary cool-toned commercial placeholder",
      sortOrder: 6,
      isActive: true,
      layout: "portrait",
    },
  ],
  services: [
    {
      title: "Wedding Photography",
      description:
        "Temporary description for considered coverage of a wedding day and its defining moments.",
    },
    {
      title: "Portrait Photography",
      description:
        "Temporary description for individual, couple, family, and editorial portrait sessions.",
    },
    {
      title: "Event Photography",
      description:
        "Temporary description for calm, observant coverage of personal and professional gatherings.",
    },
    {
      title: "Commercial Photography",
      description:
        "Temporary description for visual work shaped around a brand, space, product, or campaign.",
    },
  ],
  contact: {
    eyebrow: "Contact",
    title: "Let’s create something memorable.",
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
