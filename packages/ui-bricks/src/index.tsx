export * from "./blocks/marketing/Hero";
export { default as BenefitsGrid } from "./blocks/marketing/benefits-grid";
export * from "./blocks/commerce/ProductGrid";
export * from "./blocks/layout/Header";
export * from "./blocks/layout/Footer";

// Components
export { default as ProductCard } from "./components/product-card";
export { default as SkeletonCard } from "./components/skeleton-card";
export { default as CartDrawer } from "./components/cart-drawer";
export { default as ScrollAnimation } from "./components/ui/scroll-animation";
export { default as AnimatedCounter } from "./components/ui/animated-counter";
export { default as PageTransition } from "./components/ui/page-transition";

// Hooks
export * from "./hooks/use-cart";

export const Button = () => {
  return <button>Click me</button>;
};
