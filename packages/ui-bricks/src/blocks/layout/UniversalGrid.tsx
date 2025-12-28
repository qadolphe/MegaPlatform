"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./UniversalGrid.module.css";

interface GridItem {
  type: "product" | "video" | "info" | "image";
  colSpan?: number;
  rowSpan?: number;
  
  // Common
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  
  // Product-specific
  productId?: string;
  price?: number;
  
  // Video-specific
  videoUrl?: string;
  duration?: string;
  
  // Info-specific
  icon?: string;
  buttonText?: string;
}

interface UniversalGridProps {
  title?: string;
  subtitle?: string;
  items?: GridItem[];
  products?: any[]; // Passed from parent
  columns?: number;
  gap?: "small" | "medium" | "large";
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: AnimationTheme;
}

export const UniversalGrid = ({
  title,
  subtitle,
  items = [],
  products = [],
  columns = 4,
  gap = "medium",
  backgroundColor,
  titleColor,
  textColor,
  accentColor = "#3b82f6",
  animationStyle = "simple",
}: UniversalGridProps) => {
  const gapSize = { small: "0.5rem", medium: "1rem", large: "1.5rem" }[gap];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  const renderItem = (item: GridItem, index: number) => {
    const colSpan = item.colSpan || 1;
    const rowSpan = item.rowSpan || 1;

    // Resolve product data if type is product
    let displayTitle = item.title;
    let displayDesc = item.description;
    let displayImage = item.image;
    let displayPrice = item.price;
    let displayLink = item.link;

    if (item.type === 'product' && item.productId) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        displayTitle = item.title || product.name;
        displayDesc = item.description || product.description;
        displayImage = item.image || product.image_url;
        displayPrice = item.price || product.base_price; 
        displayLink = item.link || `/products/${product.slug}`;
      }
    }

    switch (item.type) {
      case "product":
        return (
          <ScrollAnimation
            key={index}
            theme={animationStyle}
            delay={index * 0.05}
            hoverable
            className={styles.gridItem}
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
          >
            <Link href={displayLink || "#"} className={styles.productCard}>
              <div className={styles.imageContainer}>
                {displayImage && (
                  <Image
                    src={displayImage}
                    alt={displayTitle || "Product"}
                    fill
                    className={styles.image}
                  />
                )}
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.itemTitle} style={{ color: textColor }}>
                  {displayTitle}
                </h4>
                {displayDesc && (
                  <p className={styles.itemDesc} style={{ color: textColor ? `${textColor}cc` : undefined }}>
                    {displayDesc}
                  </p>
                )}
                <div className={styles.priceRow}>
                  <span className={styles.price} style={{ color: accentColor }}>
                    {displayPrice ? (item.productId ? `$${displayPrice}` : formatPrice(displayPrice)) : ''}
                  </span>
                  <div className={styles.arrowIcon} style={{ backgroundColor: accentColor }}>
                    <ArrowRight size={16} color="#fff" />
                  </div>
                </div>
              </div>
            </Link>
          </ScrollAnimation>
        );

      case "video":
        return (
          <ScrollAnimation
            key={index}
            theme={animationStyle}
            delay={index * 0.05}
            hoverable
            className={styles.gridItem}
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
          >
            <a
              href={item.videoUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.videoCard}
            >
              <div className={styles.imageContainer}>
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title || "Video"}
                    fill
                    className={styles.image}
                  />
                )}
                <div className={styles.playOverlay}>
                  <div
                    className={styles.playButton}
                    style={{ backgroundColor: accentColor }}
                  >
                    <Play size={24} fill="#fff" />
                  </div>
                </div>
                {item.duration && (
                  <span className={styles.duration}>{item.duration}</span>
                )}
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.itemTitle} style={{ color: textColor }}>
                  {item.title}
                </h4>
                {item.description && (
                  <p className={styles.itemDesc} style={{ color: textColor }}>
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          </ScrollAnimation>
        );

      case "info":
        return (
          <ScrollAnimation
            key={index}
            theme={animationStyle}
            delay={index * 0.05}
            hoverable
            className={styles.gridItem}
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
          >
            <div className={styles.infoCard}>
              {item.image && (
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title || "Info"}
                    fill
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.cardContent}>
                <h4 className={styles.itemTitle} style={{ color: textColor }}>
                  {item.title}
                </h4>
                {item.description && (
                  <p className={styles.itemDesc} style={{ color: textColor }}>
                    {item.description}
                  </p>
                )}
                {item.link && item.buttonText && (
                  <Link
                    href={item.link}
                    className={styles.infoButton}
                    style={{ color: accentColor }}
                  >
                    {item.buttonText} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </ScrollAnimation>
        );

      case "image":
        return (
          <ScrollAnimation
            key={index}
            theme={animationStyle}
            delay={index * 0.05}
            hoverable
            className={styles.gridItem}
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
          >
            {item.link ? (
              <Link href={item.link} className={styles.imageCard}>
                <div className={styles.fullImageContainer}>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title || "Image"}
                      fill
                      className={styles.image}
                    />
                  )}
                  {item.title && (
                    <div className={styles.imageOverlay}>
                      <h4 className={styles.imageTitle}>{item.title}</h4>
                      {item.description && (
                        <p className={styles.imageDesc}>{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className={styles.imageCard}>
                <div className={styles.fullImageContainer}>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title || "Image"}
                      fill
                      className={styles.image}
                    />
                  )}
                  {item.title && (
                    <div className={styles.imageOverlay}>
                      <h4 className={styles.imageTitle}>{item.title}</h4>
                      {item.description && (
                        <p className={styles.imageDesc}>{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollAnimation>
        );

      default:
        return null;
    }
  };

  return (
    <section
      className={styles.section}
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && (
            <h2 className={styles.title} style={{ color: titleColor }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={styles.subtitle} style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapSize,
        }}
      >
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </section>
  );
};
