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
  },
  Testimonials: {
    label: "Testimonials",
    defaultProps: {
      title: "What Our Customers Say",
      subtitle: "Real reviews from real customers",
      testimonials: [
        { name: "Sarah J.", role: "Verified Buyer", content: "Absolutely love the quality! Will definitely be ordering again.", rating: 5 },
        { name: "Mike R.", role: "Repeat Customer", content: "Best purchase I've made this year. Fast shipping and great customer service.", rating: 5 },
        { name: "Emily K.", role: "Verified Buyer", content: "The attention to detail is incredible. Highly recommend!", rating: 4 },
      ],
      columns: 3,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns", min: 1, max: 4, section: SECTIONS.SETTINGS },
      {
        name: "testimonials",
        type: "array",
        label: "Testimonials",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "name", type: "text", label: "Name" },
          { name: "role", type: "text", label: "Role" },
          { name: "content", type: "textarea", label: "Review" },
          { name: "rating", type: "number", label: "Rating (1-5)", min: 1, max: 5 },
          { name: "avatar", type: "image", label: "Avatar" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  FAQ: {
    label: "FAQ",
    defaultProps: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know",
      items: [
        { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items. Simply contact our support team to initiate a return." },
        { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery." },
        { question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide. Shipping rates and times vary by location." },
        { question: "How can I track my order?", answer: "Once your order ships, you'll receive a tracking number via email to monitor your package's journey." },
      ],
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      {
        name: "items",
        type: "array",
        label: "Questions",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "question", type: "text", label: "Question" },
          { name: "answer", type: "textarea", label: "Answer" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Banner: {
    label: "Banner",
    defaultProps: {
      text: "🎉 Free shipping on orders over $50!",
      linkText: "Shop Now",
      linkUrl: "/products",
      icon: "tag",
      dismissible: true,
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      accentColor: "#fbbf24",
      animationStyle: "theme"
    },
    fields: [
      { name: "text", type: "text", label: "Banner Text", section: SECTIONS.CONTENT },
      { name: "linkText", type: "text", label: "Link Text", section: SECTIONS.CONTENT },
      { name: "linkUrl", type: "page-link", label: "Link URL", section: SECTIONS.CONTENT },
      {
        name: "icon",
        type: "select",
        label: "Icon",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Tag", value: "tag" },
          { label: "Zap", value: "zap" },
          { label: "None", value: "none" }
        ]
      },
      { name: "dismissible", type: "boolean", label: "Can Dismiss", section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  LogoCloud: {
    label: "Logo Cloud",
    defaultProps: {
      title: "Trusted by leading brands",
      logos: [
        { name: "Company 1", image: "https://via.placeholder.com/150x50?text=Logo+1" },
        { name: "Company 2", image: "https://via.placeholder.com/150x50?text=Logo+2" },
        { name: "Company 3", image: "https://via.placeholder.com/150x50?text=Logo+3" },
        { name: "Company 4", image: "https://via.placeholder.com/150x50?text=Logo+4" },
        { name: "Company 5", image: "https://via.placeholder.com/150x50?text=Logo+5" },
      ],
      grayscale: true,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      {
        name: "logos",
        type: "array",
        label: "Logos",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "name", type: "text", label: "Company Name" },
          { name: "image", type: "image", label: "Logo Image" },
          { name: "url", type: "text", label: "Website URL" }
        ]
      },
      { name: "grayscale", type: "boolean", label: "Grayscale Logos", section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Countdown: {
    label: "Countdown Timer",
    defaultProps: {
      title: "Sale Ends In",
      subtitle: "Don't miss out on these amazing deals!",
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      linkText: "Shop Sale",
      linkUrl: "/products",
      accentColor: "#ef4444",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "endDate", type: "text", label: "End Date (ISO format)", section: SECTIONS.SETTINGS },
      { name: "linkText", type: "text", label: "Button Text", section: SECTIONS.CONTENT },
      { name: "linkUrl", type: "page-link", label: "Button Link", section: SECTIONS.CONTENT },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Timer Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Features: {
    label: "Features",
    defaultProps: {
      features: [
        { title: "Free Shipping", description: "On orders over $50", icon: "truck" },
        { title: "Secure Payment", description: "100% secure checkout", icon: "shield" },
        { title: "Fast Delivery", description: "2-3 business days", icon: "clock" },
        { title: "Easy Returns", description: "30-day return policy", icon: "creditCard" },
      ],
      layout: "horizontal",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      {
        name: "features",
        type: "array",
        label: "Features",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "title", type: "text", label: "Title" },
          { name: "description", type: "text", label: "Description" },
          { name: "value", type: "text", label: "Stat Value (optional)" },
          { 
            name: "icon", 
            type: "select", 
            label: "Icon",
            options: [
              { label: "Truck", value: "truck" },
              { label: "Shield", value: "shield" },
              { label: "Clock", value: "clock" },
              { label: "Credit Card", value: "creditCard" },
              { label: "Heart", value: "heart" },
              { label: "Star", value: "star" },
              { label: "Award", value: "award" },
              { label: "Zap", value: "zap" }
            ]
          }
        ]
      },
      {
        name: "layout",
        type: "select",
        label: "Layout",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Horizontal Row", value: "horizontal" },
          { label: "2-Column Grid", value: "grid" }
        ]
      },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  }
};
