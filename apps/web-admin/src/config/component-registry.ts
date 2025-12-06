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
  BenefitsGrid: {
    label: "Benefits Grid",
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
