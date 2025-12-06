// Define what props are available for editing for each component
export const COMPONENT_DEFINITIONS = {
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
      { name: "primaryCtaText", type: "text", label: "Primary Button" },
      { name: "primaryCtaLink", type: "text", label: "Primary Link" },
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
    defaultProps: { category: "all" },
    fields: [
      { name: "category", type: "text", label: "Category Filter" },
    ]
  }
};
