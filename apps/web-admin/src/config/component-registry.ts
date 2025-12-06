// Define what props are available for editing for each component
export const COMPONENT_DEFINITIONS = {
  Hero: {
    label: "Hero Section",
    defaultProps: { title: "Welcome", subtitle: "Best hoodies in town" },
    fields: [
      { name: "title", type: "text", label: "Headline" },
      { name: "subtitle", type: "text", label: "Subheadline" },
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
