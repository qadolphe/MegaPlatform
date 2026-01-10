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
  titleColor,
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
  titleColor?: string,
  buttonColor?: string,
  buttonTextColor?: string,
  hoverColor?: string
}) => {
  const isExpandable = layout === 'expandable';

  // --- OBSERVER STATE ---
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

    // Initialize observer
    setTimeout(() => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => observer.disconnect();
  }, [isExpandable, products]);

  // --- CHUNK LOGIC FOR EXPANDABLE ROWS ---
  // We split products into groups (rows) so each row acts as an isolated flex container.
  // This prevents the "snap below" issue because separate rows never interact.
  const productRows = isExpandable 
    ? products.reduce((rows, product, index) => {
        const chunkIndex = Math.floor(index / (columns || 4));
        if (!rows[chunkIndex]) rows[chunkIndex] = [];
        rows[chunkIndex].push({ product, originalIndex: index });
        return rows;
      }, [] as { product: any, originalIndex: number }[][])
    : [];

  // Dynamic grid columns style for standard layout
  const gridStyle = !isExpandable && columns ? {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  } : {};

  return (
    <section 
      className={styles.productsSection}
      style={{ '--product-grid-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
    >
      <h2 className={styles.sectionTitle} style={{ color: titleColor || 'var(--color-text)' }}>{title}</h2>
      
      {/* --- EXPANDABLE LAYOUT --- */}
      {isExpandable ? (
        <div className={styles.expandableGridContainer}>
          {productRows.map((row: { product: any, originalIndex: number }[], rowIndex: number) => (
            <div key={rowIndex} className={`${styles.expandableRow} expandable-row`}>
              {row.map(({ product, originalIndex }) => (
                <div 
                  key={product.id}
                  ref={(el) => { observerRefs.current[originalIndex] = el }}
                  className={styles.expandableWrapper}
                  data-id={product.id}
                >
                  <ProductCard 
                      product={product}
                      isActive={focusedCardId === product.id}
                      buttonColor={buttonColor}
                      buttonTextColor={buttonTextColor}
                      hoverColor={hoverColor}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* --- STANDARD GRID LAYOUT --- */
        <div 
          className={`${styles.standardGridContainer} product-card-container`}
          style={gridStyle as React.CSSProperties}
        >
          {products.map((product, index) => (
            <ScrollAnimation 
              key={product.id} 
              theme={animationStyle} 
              delay={index * 0.05}
              hoverable={true}
              className={styles.standardGridItem}
            >
              <ProductCard 
                  product={product} 

                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  hoverColor={hoverColor}
              />
            </ScrollAnimation>
          ))}
        </div>
      )}
    </section>
  );
};