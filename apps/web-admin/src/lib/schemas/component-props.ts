
import { z } from "zod";

// --- Shared Schemas ---

const LinkSchema = z.object({
    label: z.string().optional(),
    href: z.string().optional(),
});

const ColumnLinkSchema = z.object({
    title: z.string().optional(),
    links: z.array(LinkSchema).optional(),
});

const SocialLinkSchema = z.object({
    platform: z.enum(["instagram", "twitter", "facebook", "youtube", "linkedin"]).optional(),
    url: z.string().optional(),
});

const AnimationStyleSchema = z.enum(["theme", "simple", "playful", "elegant", "dynamic", "none"]).optional().default("theme");

// --- Component Props Schemas ---

export const HeaderPropsSchema = z.object({
    logoText: z.string().optional(),
    logoImage: z.string().optional(),
    links: z.array(LinkSchema).optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    sticky: z.boolean().optional(),
    centered: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    backgroundOpacity: z.number().min(0).max(100).optional(),
    textColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
    showCart: z.boolean().optional(), // Injected at runtime
});

export const FooterPropsSchema = z.object({
    storeName: z.string().optional(),
    storeDescription: z.string().optional(),
    logoImage: z.string().optional(),
    columns: z.array(ColumnLinkSchema).optional(),
    socialLinks: z.array(SocialLinkSchema).optional(),
    showNewsletter: z.boolean().optional(),
    newsletterTitle: z.string().optional(),
    newsletterDescription: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    contactAddress: z.string().optional(),
    copyrightText: z.string().optional(),
    backgroundColor: z.string().optional(),
    backgroundOpacity: z.number().min(0).max(100).optional(),
    textColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const HeroPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    backgroundImage: z.string().optional(),
    primaryCtaText: z.string().optional(),
    primaryCtaLink: z.string().optional(),
    secondaryCtaText: z.string().optional(),
    secondaryCtaLink: z.string().optional(),
    titleColor: z.string().optional(),
    subtitleColor: z.string().optional(),
    buttonColor: z.string().optional(),
    buttonTextColor: z.string().optional(),
    overlayColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const ProductGridPropsSchema = z.object({
    title: z.string().optional(),
    sourceType: z.enum(["collection", "manual"]).optional().default("collection"),
    collectionId: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    columns: z.number().min(1).optional(),
    layout: z.enum(["grid", "expandable"]).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    buttonColor: z.string().optional(),
    buttonTextColor: z.string().optional(),
    hoverColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
    // Runtime injected
    products: z.array(z.any()).optional(),
});

export const ProductDetailPropsSchema = z.object({
    buttonAction: z.enum(["addToCart", "buyNow", "contact"]).optional(),
    animationStyle: AnimationStyleSchema,
    product: z.any().optional(), // Runtime injected
});

export const InfoGridPropsSchema = z.object({
    title: z.string().optional(),
    columns: z.number().min(1).optional(),
    items: z.array(z.any()).optional(), // Packet hydration handles content
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const TextContentPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    body: z.string().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    image: z.string().optional(),
    imagePosition: z.enum(["left", "right"]).optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const NewsletterPropsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    placeholder: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    buttonColor: z.string().optional(),
    buttonTextColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const CustomerProfilePropsSchema = z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
});

export const VideoGridPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    items: z.array(z.any()).optional(),
    columns: z.number().min(1).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const ImageBoxPropsSchema = z.object({
    image: z.string().optional(),
    caption: z.string().optional(),
    width: z.enum(["full", "wide", "medium", "small"]).optional(),
    aspectRatio: z.enum(["auto", "16/9", "4/3", "1/1"]).optional(),
    backgroundColor: z.string().optional(),
    captionColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const TestimonialsPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    testimonials: z.array(z.any()).optional(),
    columns: z.number().min(1).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const FAQPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    faqs: z.array(z.any()).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const BannerPropsSchema = z.object({
    text: z.string().optional(),
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
    icon: z.enum(["tag", "zap", "none"]).optional(),
    dismissible: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const LogoCloudPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    logos: z.array(z.any()).optional(),
    grayscale: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const CountdownPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    endDate: z.string().optional(),
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
    accentColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const FeaturesPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    features: z.array(z.any()).optional(),
    layout: z.enum(["horizontal", "grid"]).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const StatsSectionPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    packetIds: z.array(z.string()).optional(),
    stats: z.array(z.object({
        value: z.union([z.string(), z.number()]).optional(),
        label: z.string().optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
    })).optional(),
    layout: z.enum(["horizontal", "grid"]).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

export const UniversalGridPropsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    columns: z.number().min(1).max(6).optional(),
    gap: z.enum(["small", "medium", "large"]).optional(),
    items: z.array(z.any()).optional(),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    textColor: z.string().optional(),
    accentColor: z.string().optional(),
    animationStyle: AnimationStyleSchema,
});

// --- Master Schema ---

export const LayoutBlockSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("Header"), id: z.string(), props: HeaderPropsSchema }),
    z.object({ type: z.literal("Footer"), id: z.string(), props: FooterPropsSchema }),
    z.object({ type: z.literal("Hero"), id: z.string(), props: HeroPropsSchema }),
    z.object({ type: z.literal("ProductGrid"), id: z.string(), props: ProductGridPropsSchema }),
    z.object({ type: z.literal("ProductDetail"), id: z.string(), props: ProductDetailPropsSchema }),
    z.object({ type: z.literal("InfoGrid"), id: z.string(), props: InfoGridPropsSchema }),
    z.object({ type: z.literal("BenefitsGrid"), id: z.string(), props: InfoGridPropsSchema }), // Alias
    z.object({ type: z.literal("TextContent"), id: z.string(), props: TextContentPropsSchema }),
    z.object({ type: z.literal("Newsletter"), id: z.string(), props: NewsletterPropsSchema }),
    z.object({ type: z.literal("CustomerProfile"), id: z.string(), props: CustomerProfilePropsSchema }),
    z.object({ type: z.literal("VideoGrid"), id: z.string(), props: VideoGridPropsSchema }),
    z.object({ type: z.literal("ImageBox"), id: z.string(), props: ImageBoxPropsSchema }),
    z.object({ type: z.literal("Testimonials"), id: z.string(), props: TestimonialsPropsSchema }),
    z.object({ type: z.literal("FAQ"), id: z.string(), props: FAQPropsSchema }),
    z.object({ type: z.literal("Banner"), id: z.string(), props: BannerPropsSchema }),
    z.object({ type: z.literal("LogoCloud"), id: z.string(), props: LogoCloudPropsSchema }),
    z.object({ type: z.literal("Countdown"), id: z.string(), props: CountdownPropsSchema }),
    z.object({ type: z.literal("Features"), id: z.string(), props: FeaturesPropsSchema }),
    z.object({ type: z.literal("StatsSection"), id: z.string(), props: StatsSectionPropsSchema }),
    z.object({ type: z.literal("UniversalGrid"), id: z.string(), props: UniversalGridPropsSchema }),
]);

export const LayoutConfigSchema = z.array(LayoutBlockSchema);

// Helper for type inference
export type LayoutBlock = z.infer<typeof LayoutBlockSchema>;
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
