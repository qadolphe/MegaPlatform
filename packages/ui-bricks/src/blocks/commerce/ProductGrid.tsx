"use client";
import { useEffect, useRef, useState } from "react";
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
  backgroundColor,
  buttonColor,
  buttonTextColor,
  hoverColor
}: { 
  title: string, 
  products: any[], 
  columns?: number,
  animationStyle?: AnimationTheme,
  layout?: 'grid' | 'expandable',
  backgroundColor?: string,
  buttonColor?: string,
  buttonTextColor?: string,
  hoverColor?: string
}) => {
  const isExpandable = layout === 'expandable';

  // --- SOURCE CODE LOGIC: Observer & State ---
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const observerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!isExpandable || products.length === 0) return;

    const options = {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id) setFocusedCardId(id);
        }
      });
    }, options);

    // Small timeout to ensure refs are attached
    setTimeout(() => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => observer.disconnect();
  }, [isExpandable, products]);

  return (
    <section 
      className={styles.productsSection}
      style={{ '--product-grid-bg': backgroundColor } as React.CSSProperties}
    >
      <h2 className={styles.sectionTitle}>{title}</h2>
      
      <div 
        className={`${styles.cardContainer} product-card-container`}
        style={isExpandable ? { minHeight: '500px' } : {
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: '1rem',
            minHeight: 'auto'
        }}
      >
        {products.map((product, index) => {
          
          // --- EXPANDABLE LAYOUT ---
          // Replicates page.tsx structure: Direct child, no wrapper, passes refs/active state
          if (isExpandable) {
            return (
              <ProductCard 
                key={product.id}
                product={product}
                // Pass the ref for the observer
                innerRef={(el) => { observerRefs.current[index] = el }}
                // Pass active state for internal styling
                isActive={focusedCardId === product.id}
                // Pass variant for internal content layout
                variant="expandable"
                // Pass styling props
                buttonColor={buttonColor}
                buttonTextColor={buttonTextColor}
                hoverColor={hoverColor}
                // Apply the CSS class that handles the flex transition
                className={`${styles.expandableCard} ${focusedCardId === product.id ? styles.active : ''}`}
                // Data attribute for the observer to read
                data-id={product.id} 
              />
            );
          }

          // --- STANDARD GRID LAYOUT ---
          return (
            <ScrollAnimation 
              key={product.id} 
              theme={animationStyle} 
              delay={index * 0.05}
              hoverable={true} 
            >
              <ProductCard 
                  product={product} 
                  variant="standard"
                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  hoverColor={hoverColor}
              />
            </ScrollAnimation>
          );
        })}
      </div>
    </section>
  );
};