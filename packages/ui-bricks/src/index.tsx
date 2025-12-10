export * from "./blocks/marketing/Hero";
export * from "./blocks/marketing/InfoGrid";
export * from "./blocks/content/TextContent";
export * from "./blocks/media/VideoGrid";
export * from "./blocks/media/ImageBox";
export * from "./blocks/commerce/ProductGrid";
export * from "./blocks/commerce/ProductDetail";
export * from "./blocks/layout/Header";
export * from "./blocks/layout/Footer";

// Components
export * from "./components/ProductCard";
export * from "./components/SkeletonCard";
export * from "./components/CartDrawer";
export { default as ScrollAnimation } from "./components/ui/scroll-animation";
export { default as AnimatedCounter } from "./components/ui/animated-counter";
export { default as PageTransition } from "./components/ui/page-transition";

// Hooks
export * from "./hooks/use-cart";

export const Button = () => {
  return <button>Click me</button>;
};
