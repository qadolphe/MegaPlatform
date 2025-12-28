"use client";

import { Hero, ProductGrid, InfoGrid, Header, Footer, ProductDetail, TextContent, VideoGrid, ImageBox, Testimonials, FAQ, Banner, LogoCloud, Countdown, Features, Newsletter, CustomerProfile, UniversalGrid } from "@repo/ui-bricks";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";

// Component Registry - must match storefront
const COMPONENT_REGISTRY: Record<string, any> = {
    'Header': Header,
    'Footer': Footer,
    'Hero': Hero,
    'ProductGrid': ProductGrid,
    'BenefitsGrid': InfoGrid,
    'InfoGrid': InfoGrid,
    'ProductDetail': ProductDetail,
    'TextContent': TextContent,
    'VideoGrid': VideoGrid,
    'ImageBox': ImageBox,
    'Testimonials': Testimonials,
    'FAQ': FAQ,
    'Banner': Banner,
    'LogoCloud': LogoCloud,
    'Countdown': Countdown,
    'Features': Features,
    'Newsletter': Newsletter,
    'CustomerProfile': CustomerProfile,
    'UniversalGrid': UniversalGrid,
};

// Sanitize props (replace local image paths)
const sanitizeProps = (props: any): any => {
    if (!props) return props;
    if (typeof props === 'string' && (props.startsWith('/images/') || props.startsWith('/'))) {
        if (props.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
        }
    }
    if (Array.isArray(props)) {
        return props.map(sanitizeProps);
    }
    if (typeof props === 'object') {
        const newProps: any = {};
        for (const key in props) {
            newProps[key] = sanitizeProps(props[key]);
        }
        return newProps;
    }
    return props;
};

export interface LayoutBlock {
    id: string;
    type: string;
    props: Record<string, any>;
}

export interface StoreColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

interface LayoutRendererProps {
    layout: LayoutBlock[];
    colors: StoreColors;
    theme?: string;
    products?: any[];
    productsMap?: Record<string, any[]>;
    productDetailData?: any;
    showCart?: boolean;
}

export function LayoutRenderer({
    layout,
    colors,
    theme = 'simple',
    products = [],
    productsMap = {},
    productDetailData,
    showCart = false,
}: LayoutRendererProps) {
    return (
        <main
            style={{
                '--color-primary': colors.primary || '#000000',
                '--color-secondary': colors.secondary || '#ffffff',
                '--color-accent': colors.accent || '#3b82f6',
                '--color-background': colors.background || '#ffffff',
                '--color-text': colors.text || '#000000',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                minHeight: '100vh',
            } as React.CSSProperties}
        >
            {layout.map((block, index) => {
                const Component = COMPONENT_REGISTRY[block.type];
                if (!Component) return null;

                // Merge defaults
                const def = COMPONENT_DEFINITIONS[block.type as keyof typeof COMPONENT_DEFINITIONS];
                const defaultProps = def ? def.defaultProps : {};
                let props = sanitizeProps({ ...defaultProps, ...block.props });

                // Inject products into ProductGrid
                if (block.type === 'ProductGrid') {
                    const colId = block.props?.collectionId || 'all';
                    props = {
                        ...props,
                        products: productsMap[colId] || products,
                        columns: block.props?.columns || 4,
                    };
                }

                // Inject product data into ProductDetail
                if (block.type === 'ProductDetail' && productDetailData) {
                    props = { ...props, product: productDetailData };
                }

                // Inject showCart for Header
                if (block.type === 'Header') {
                    props.showCart = showCart;
                }

                // Inject global theme
                if (props.animationStyle === 'theme') {
                    props.animationStyle = theme;
                }

                return <Component key={block.id || index} {...props} />;
            })}
        </main>
    );
}
