export * from "./blocks/marketing/Hero";
export * from "./blocks/marketing/benefits-grid";
export * from "./blocks/commerce/ProductGrid";
export * from "./blocks/layout/Header";
export * from "./blocks/layout/Footer";

// Components
export * from "./components/product-card";
export * from "./components/skeleton-card";
export * from "./components/cart-drawer";
export { default as ScrollAnimation } from "./components/ui/scroll-animation";
export { default as AnimatedCounter } from "./components/ui/animated-counter";
export { default as PageTransition } from "./components/ui/page-transition";

// Hooks
export * from "./hooks/use-cart";

export const Button = () => {
  return <button>Click me</button>;
};
