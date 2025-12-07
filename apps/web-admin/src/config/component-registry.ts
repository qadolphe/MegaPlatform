// Define what props are available for editing for each component
export const COMPONENT_DEFINITIONS = {
  Header: {
    label: "Header",
    defaultProps: {
      logoText: "My Store",
      links: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
        { label: "About", href: "/about" }
      ]
    },
    fields: [
      { name: "logoText", type: "text", label: "Logo Text" },
      { 
        name: "links", 
        type: "array", 
        label: "Navigation Links",
        itemSchema: [
          { name: "label", type: "text", label: "Label" },
          { name: "href", type: "page-link", label: "Link" }
        ]
      }
    ]
  },
  Footer: {
    label: "Footer",
    defaultProps: {},
    fields: []
  },
  Hero: {
    label: "Hero Section",
    defaultProps: { 
      title: "Welcome", 
      subtitle: "Best hoodies in town",
      backgroundImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80"
    },
    fields: [
      { name: "title", type: "text", label: "Headline" },
      { name: "subtitle", type: "text", label: "Subheadline" },
      { name: "backgroundImage", type: "image", label: "Background Image" },
      { name: "primaryCtaText", type: "text", label: "Primary Button Label" },
      { name: "primaryCtaLink", type: "page-link", label: "Primary Button Link" },
      { name: "secondaryCtaText", type: "text", label: "Secondary Button Label" },
      { name: "secondaryCtaLink", type: "page-link", label: "Secondary Button Link" },
    ]
  },
  InfoGrid: {
    label: "Info Grid",
    defaultProps: { 
      title: "Info Grid", 
      columns: 3, 
      items: [
        { title: "Feature 1", description: "Description here", colSpan: 1 },
        { title: "Feature 2", description: "Description here", colSpan: 1 },
        { title: "Feature 3", description: "Description here", colSpan: 1 },
      ] 
    },
    fields: [
      { name: "title", type: "text", label: "Section Title" },
      { name: "columns", type: "number", label: "Columns" },
      { 
        name: "items", 
        type: "array", 
        label: "Grid Items",
        itemSchema: [
          { name: "title", type: "text", label: "Title" },
          { name: "description", type: "text", label: "Description" },
          { name: "image", type: "image", label: "Image" },
          { name: "colSpan", type: "number", label: "Column Span" }
        ]
      }
    ]
  },
  BenefitsGrid: {
    label: "Benefits Grid (Legacy)",
    defaultProps: { title: "Why Us?" },
    fields: [
      { name: "title", type: "text", label: "Section Title" },
    ]
  },
  ProductGrid: {
    label: "Product Grid",
    defaultProps: { 
      title: "Featured Products",
      collectionId: "all",
      columns: 4
    },
    fields: [
      { name: "title", type: "text", label: "Section Title" },
      { name: "collectionId", type: "collection-select", label: "Collection" },
      { name: "columns", type: "number", label: "Columns (2-6)" },
    ]
  }
};
