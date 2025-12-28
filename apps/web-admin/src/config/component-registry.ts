// Define what props are available for editing for each component

const SECTIONS = {
  CONTENT: "Content",
  DESIGN: "Design & Colors",
  SETTINGS: "Settings"
};

// Component Categories for Editor Sidebar
export const COMPONENT_CATEGORIES = {
  LAYOUT: { label: "Layout", order: 1 },
  COMMERCE: { label: "Commerce", order: 2 },
  MARKETING: { label: "Marketing", order: 3 },
  CONTENT: { label: "Content", order: 4 },
  MEDIA: { label: "Media", order: 5 },
  SOCIAL: { label: "Social Proof", order: 6 },
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

export const COMPONENT_DEFINITIONS: Record<string, { label: string; category: string; defaultProps: any; fields: any[] }> = {
  Header: {
    label: "Header",
    category: "LAYOUT",
    defaultProps: {
      logoText: "My Store",
      links: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
        { label: "About", href: "/about" }
      ],
      sticky: true,
      centered: false,
      animationStyle: "theme"
    },
    fields: [
      { name: "logoText", type: "text", label: "Logo Text", section: SECTIONS.CONTENT },
      { name: "logoImage", type: "image", label: "Logo Image (overrides text)", section: SECTIONS.CONTENT },
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
      { name: "ctaText", type: "text", label: "CTA Button Text", section: SECTIONS.CONTENT },
      { name: "ctaLink", type: "page-link", label: "CTA Button Link", section: SECTIONS.CONTENT },
      { name: "sticky", type: "boolean", label: "Sticky Header", section: SECTIONS.SETTINGS },
      { name: "centered", type: "boolean", label: "Center Navigation", section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "backgroundOpacity", type: "number", label: "Background Opacity (%)", min: 0, max: 100, section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Footer: {
    label: "Footer",
    category: "LAYOUT",
    defaultProps: {
      storeName: "My Store",
      storeDescription: "Quality products for everyone.",
      columns: [
        { title: "Shop", links: [{ label: "All Products", href: "/products" }, { label: "New Arrivals", href: "/new" }] },
        { title: "Support", links: [{ label: "About Us", href: "/about" }, { label: "FAQ", href: "/faq" }] }
      ],
      showNewsletter: true,
      newsletterTitle: "Stay Updated",
      newsletterDescription: "Subscribe for updates and offers.",
      animationStyle: "theme"
    },
    fields: [
      { name: "storeName", type: "text", label: "Store Name", section: SECTIONS.CONTENT },
      { name: "storeDescription", type: "textarea", label: "Store Description", section: SECTIONS.CONTENT },
      { name: "logoImage", type: "image", label: "Logo Image (overrides name)", section: SECTIONS.CONTENT },
      {
        name: "columns",
        type: "array",
        label: "Link Columns",
        section: SECTIONS.CONTENT,
        itemSchema: [
          { name: "title", type: "text", label: "Column Title" },
          {
            name: "links",
            type: "array",
            label: "Links",
            itemSchema: [
              { name: "label", type: "text", label: "Label" },
              { name: "href", type: "page-link", label: "Link" }
            ]
          }
        ]
      },
      {
        name: "socialLinks",
        type: "array",
        label: "Social Links",
        section: SECTIONS.CONTENT,
        itemSchema: [
          {
            name: "platform",
            type: "select",
            label: "Platform",
            options: [
              { label: "Instagram", value: "instagram" },
              { label: "Twitter", value: "twitter" },
              { label: "Facebook", value: "facebook" },
              { label: "YouTube", value: "youtube" },
              { label: "LinkedIn", value: "linkedin" }
            ]
          },
          { name: "url", type: "text", label: "URL" }
        ]
      },
      { name: "showNewsletter", type: "boolean", label: "Show Newsletter", section: SECTIONS.SETTINGS },
      { name: "newsletterTitle", type: "text", label: "Newsletter Title", section: SECTIONS.CONTENT },
      { name: "newsletterDescription", type: "text", label: "Newsletter Description", section: SECTIONS.CONTENT },
      { name: "contactEmail", type: "text", label: "Contact Email", section: SECTIONS.CONTENT },
      { name: "contactPhone", type: "text", label: "Contact Phone", section: SECTIONS.CONTENT },
      { name: "contactAddress", type: "text", label: "Contact Address", section: SECTIONS.CONTENT },
      { name: "copyrightText", type: "text", label: "Copyright Text", section: SECTIONS.CONTENT },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "backgroundOpacity", type: "number", label: "Background Opacity (%)", min: 0, max: 100, section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Hero: {
    label: "Hero Section",
    category: "MARKETING",
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
    category: "CONTENT",
    defaultProps: {
      title: "Info Grid",
      columns: 3,
      items: [],
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns", min: 1, section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  BenefitsGrid: {
    label: "Benefits Grid (Legacy)",
    category: "CONTENT",
    defaultProps: { title: "Why Us?", animationStyle: "theme" },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      ANIMATION_FIELD
    ]
  },
  ProductGrid: {
    label: "Product Grid",
    category: "COMMERCE",
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
    category: "COMMERCE",
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
    category: "CONTENT",
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
    category: "MARKETING",
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
    category: "COMMERCE",
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
    category: "MEDIA",
    defaultProps: {
      title: "Tutorials",
      subtitle: "Watch and learn",
      items: [],
      columns: 3,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns (2-4)", min: 1, section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  ImageBox: {
    label: "Image Box",
    category: "MEDIA",
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
    category: "SOCIAL",
    defaultProps: {
      title: "What Our Customers Say",
      subtitle: "Real reviews from real customers",
      testimonials: [],
      columns: 3,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns", min: 1, max: 4, section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  FAQ: {
    label: "FAQ",
    category: "CONTENT",
    defaultProps: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know",
      faqs: [],
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      { name: "accentColor", type: "color", label: "Accent Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Banner: {
    label: "Banner",
    category: "MARKETING",
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
    category: "SOCIAL",
    defaultProps: {
      title: "Trusted by leading brands",
      logos: [],
      grayscale: true,
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "grayscale", type: "boolean", label: "Grayscale Logos", section: SECTIONS.SETTINGS },
      { name: "backgroundColor", type: "color", label: "Background Color", section: SECTIONS.DESIGN },
      { name: "titleColor", type: "color", label: "Title Color", section: SECTIONS.DESIGN },
      { name: "textColor", type: "color", label: "Text Color", section: SECTIONS.DESIGN },
      ANIMATION_FIELD
    ]
  },
  Countdown: {
    label: "Countdown Timer",
    category: "MARKETING",
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
    category: "CONTENT",
    defaultProps: {
      features: [],
      layout: "horizontal",
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
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
  },
  UniversalGrid: {
    label: "Universal Grid",
    category: "LAYOUT",
    defaultProps: {
      title: "Mixed Content Grid",
      subtitle: "Combine products, videos, and info cards",
      columns: 4,
      gap: "medium",
      items: [],
      animationStyle: "theme"
    },
    fields: [
      { name: "title", type: "text", label: "Section Title", section: SECTIONS.CONTENT },
      { name: "subtitle", type: "text", label: "Subtitle", section: SECTIONS.CONTENT },
      { name: "columns", type: "number", label: "Columns (2-6)", min: 2, max: 6, section: SECTIONS.SETTINGS },
      {
        name: "gap",
        type: "select",
        label: "Gap Size",
        section: SECTIONS.SETTINGS,
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" }
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
