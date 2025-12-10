"use client";
import { ProductCard } from "../../components/ProductCard";
import styles from "./ProductGrid.module.css";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";

export const ProductGrid = ({ 
  title, 
  products = [], 
  columns = 4,
  animationStyle = 'simple',
  layout = 'grid',
  backgroundColor
}: { 
  title: string, 
  products: any[], 
  columns?: number,
  animationStyle?: AnimationTheme,
  layout?: 'grid' | 'expandable',
  backgroundColor?: string
}) => {
  const isExpandable = layout === 'expandable';

  return (
    <section 
      className={styles.productsSection}
      style={{ '--product-grid-bg': backgroundColor } as React.CSSProperties}
    >
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div 
        className={`${styles.cardContainer} product-card-container`}
        style={isExpandable ? {
            display: 'flex',
            flexDirection: 'column', // Mobile default
            gap: '1rem',
            minHeight: '500px'
        } : {
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: '1rem'
        }}
      >
        {products.map((product, index) => (
          <ScrollAnimation 
            key={product.id} 
            theme={isExpandable ? 'none' : animationStyle} 
            delay={index * 0.05}
            hoverable={!isExpandable} // Expandable handles its own hover
            className={isExpandable ? styles.expandableWrapper : ''}
            style={isExpandable ? { height: '100%' } : {}}
          >
            <ProductCard 
                product={product} 
                variant={isExpandable ? 'expandable' : 'standard'}
            />
          </ScrollAnimation>
        ))}
      </div>
      {/* Inline style for desktop flex row override */}
      {isExpandable && (
        <style jsx global>{`
            @media (min-width: 768px) {
                .product-card-container {
                    flex-direction: row !important;
                }
            }
        `}</style>
      )}
    </section>
  );
};
