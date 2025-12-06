"use client";
import { ProductCard } from "../../components/ProductCard";
import styles from "./ProductGrid.module.css";

export const ProductGrid = ({ title, products = [] }: { title: string, products: any[] }) => {
  return (
    <section className={styles.productsSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={`${styles.cardContainer} product-card-container`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
