"use client";
import { ProductCard } from "../../components/ProductCard";
import styles from "./ProductGrid.module.css";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";

export const ProductGrid = ({ 
  title, 
  products = [], 
  columns = 4,
  animationStyle = 'simple'
}: { 
  title: string, 
  products: any[], 
  columns?: number,
  animationStyle?: AnimationTheme
}) => {
  return (
    <section className={styles.productsSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div 
        className={`${styles.cardContainer} product-card-container`}
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: '1rem'
        }}
      >
        {products.map((product, index) => (
          <ScrollAnimation 
            key={product.id} 
            theme={animationStyle} 
            delay={index * 0.05}
            hoverable={true}
          >
            <ProductCard product={product} />
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
};
