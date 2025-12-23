// Define what props are available for editing for each component

const SECTIONS = {
  CONTENT: "Content",
  DESIGN: "Design & Colors",
  SETTINGS: "Settings"
};

const ANIMATION_FIELD = {
  name: "animationStyle",
  type: "select",
  label: "Animation Style",
  section: SECTIONS.DESIGN,
  options: [
    { label: "Theme Default", value: "theme" },
    { label: "Simple (Fade Up)", value: "simple" },
    { label: "Playful (Scale Up)", value: "playful" },
    { label: "Elegant (Fade In)", value: "elegant" },
    { label: "Dynamic (Slide In)", value: "dynamic" },
    { label: "None", value: "none" }
  ]
};

export const COMPONENT_DEFINITIONS = {
  Header: {
    label: "Header",
    defaultProps: {
      logoText: "My Store",
      links: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
        { label: "About", href: "/about" }
      ],
      animationStyle: "theme"
    },
    fields: [
      { name: "logoText", type: "text", label: "Logo Text", section: SECTIONS.CONTENT },
      { 
        name: "links", 
        type: "array", 
        label: "Navigation Links",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "label", type: "text", label: "Label" },
          { name: "href", type: "page-link", label: "Link" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "backgroundOpacity", type: "number", label: "Background Opacity (%)", min: 0, max: 100, section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Footer: {
    label: "Footer",
    defaultProps: {
      animationStyle: "theme"
    },
    fields: [
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "backgroundOpacity", type: "number", label: "Background Opacity (%)", min: 0, max: 100, section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Hero: {
    label: "Hero Section",
    defaultProps: { 
      title: "Welcome", 
      subtitle: "Best hoodies in town",
      backgroundImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Headline", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subheadline", section: SECTIONS.CONTENT },
      { name: "backgroundImage", type: "image", label: "Background Image", section: SECTIONS.CONTENT },
      { name: "primaryCtaText", type: "text", label: "Primary Button Label", section: SECTIONS.CONTENT },
      { name: "primaryCtaLink", type: "page-link", label: "Primary Button Link", section: SECTIONS.CONTENT },
      { name: "secondaryCtaText", type: "text", label: "Secondary Button Label", section: SECTIONS.CONTENT },
      { name: "secondaryCtaLink", type: "page-link", label: "Secondary Button Link", section: SECTIONS.CONTENT },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "subtitleColor", type: "color", label: "Subtitle Color", section: SECTIONS.DESIGN },
      { name: "buttonColor", type: "color", label: "Button Color", section: SECTIONS.DESIGN },
      { name: "buttonTextColor", type: "color", label: "Button Text Color", section: SECTIONS.DESIGN },
      { name: "overlayColor", type: "color", label: "Gradient Overlay Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
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
      ],
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns", min: 1, section: SECTIONS.SETTINGS },
      { 
        name: "items", 
        type: "array", 
        label: "Grid Items",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "title", type: "text", label: "Title" },
          { name: "description", type: "text", label: "Description" },
          { name: "image", type: "image", label: "Image" },
          { name: "colSpan", type: "number", label: "Column Span", min: 1 }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  BenefitsGrid: {
    label: "Benefits Grid (Legacy)",
    defaultProps: { title: "Why Us?", animationStyle: "theme" },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      ANIMATION_FIELD
    ]
  },
  ProductGrid: {
    label: "Product Grid",
    defaultProps: { 
      title: "Featured Products",
      collectionId: "all",
      columns: 4,
      animationStyle: "theme",
      layout: "grid"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "collectionId", type: "collection-select", label: "Collection", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns (2-6)", min: 1, section: SECTIONS.SETTINGS },
      {
        name: "layout",
        type: "select",
        label: "Layout Style",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Standard Grid", value: "grid" },
          { label: "Expandable Cards", value: "expandable" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "buttonColor", type: "color", label: "Button Color", section: SECTIONS.DESIGN },
      { name: "buttonTextColor", type: "color", label: "Button Text Color", section: SECTIONS.DESIGN },
      { name: "hoverColor", type: "color", label: "Hover Outline Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  ProductDetail: {
    label: "Product Detail",
    defaultProps: {
      animationStyle: "theme",
      buttonAction: "addToCart"
    },
    fields: [
      {
        name: "buttonAction",
        type: "select",
        label: "Button Action",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Add to Cart", value: "addToCart" },
          { label: "Buy Now", value: "buyNow" },
          { label: "Contact Us", value: "contact" }
        ]
      },
      ANIMATION_FIELD
    ]
  },
  TextContent: {
    label: "Text Box",
    defaultProps: {
      title: "About Us",
      subtitle: "Our Story",
      body: "Share your journey here...",
      alignment: "left",
      imagePosition: "right",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "body", type: "textarea", label: "Content (Markdown/LaTeX supported)", section: SECTIONS.CONTENT }, 
      { 
        name: "alignment", 
        type: "select", 
        label: "Alignment",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" }
        ]
      },
      { name: "image", type: "image", label: "Image", section: SECTIONS.CONTENT },
      { 
        name: "imagePosition", 
        type: "select", 
        label: "Image Position",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Newsletter: {
    label: "Newsletter Signup",
    defaultProps: {
      title: "Subscribe to our newsletter",
      description: "Get the latest updates on new products and upcoming sales.",
      buttonText: "Subscribe",
      placeholder: "Enter your email",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "description", type: "text", label: "Description", section: SECTIONS.CONTENT },
      { name: "buttonText", type: "text", label: "Button Text", section: SECTIONS.CONTENT },
      { name: "placeholder", type: "text", label: "Placeholder", section: SECTIONS.CONTENT },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "buttonColor", type: "color", label: "Button Color", section: SECTIONS.DESIGN },
      { name: "buttonTextColor", type: "color", label: "Button Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  CustomerProfile: {
    label: "Customer Profile",
    defaultProps: {
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      accentColor: "#3b82f6"
    },
    fields: [
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN }
    ]
  },
  VideoGrid: {
    label: "Video Grid",
    defaultProps: {
      title: "Tutorials",
      subtitle: "Watch and learn",
      items: [
        { title: "Getting Started", description: "Basic setup guide", category: "basics", videoUrl: "https://youtube.com", thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80" }
      ],
      columns: 3,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns (2-4)", min: 1, section: SECTIONS.SETTINGS },
      { 
        name: "items", 
        type: "array", 
        label: "Videos",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "title", type: "text", label: "Title" },
          { name: "description", type: "text", label: "Description" },
          { name: "category", type: "text", label: "Category" },
          { name: "videoUrl", type: "text", label: "Video URL" },
          { name: "thumbnail", type: "image", label: "Thumbnail" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  ImageBox: {
    label: "Image Box",
    defaultProps: {
      image: "https://images.unsplash.com/photo-1523726491678-bf852e717f63?auto=format&fit=crop&w=1200&q=80",
      caption: "Beautiful imagery",
      width: "medium",
      aspectRatio: "auto",
      animationStyle: "theme"
    },
    fields: [
      { name: "image", type: "image", label: "Image URL", section: SECTIONS.CONTENT },
      { name: "caption", type: "text", label: "Caption", section: SECTIONS.CONTENT },
      { 
        name: "width", 
        type: "select", 
        label: "Width",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Full Width", value: "full" },
          { label: "Wide", value: "wide" },
          { label: "Medium", value: "medium" },
          { label: "Small", value: "small" }
        ]
      },
      { 
        name: "aspectRatio", 
        type: "select", 
        label: "Aspect Ratio",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Auto (Original)", value: "auto" },
          { label: "16:9 (Video)", value: "16/9" },
          { label: "4:3 (Standard)", value: "4/3" },
          { label: "1:1 (Square)", value: "1/1" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "captionColor", type: "color", label: "Caption Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  }
};
