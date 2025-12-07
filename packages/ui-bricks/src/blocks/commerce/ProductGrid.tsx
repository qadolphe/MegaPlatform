"use client";
import { ProductCard } from "../../components/ProductCard";
import styles from "./ProductGrid.module.css";

export const ProductGrid = ({ 
  title, 
  products = [], 
  columns = 4 
}: { 
  title: string, 
  products: any[], 
  columns?: number 
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
