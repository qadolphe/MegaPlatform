"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, Shield, Clock, CreditCard, Heart, Star, Award, Zap } from "lucide-react";
import { getAnimation } from "../../lib/animation-config";
import styles from "./Features.module.css";

interface Feature {
  title: string;
  description?: string;
  icon?: string;
  value?: string;
}

interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  layout?: "grid" | "horizontal";
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: string;
  theme?: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  truck: Truck,
  shield: Shield,
  clock: Clock,
  creditCard: CreditCard,
  heart: Heart,
  star: Star,
  award: Award,
  zap: Zap,
};

export function Features({
  title,
  subtitle,
  features = [
    { title: "Free Shipping", description: "On orders over $50", icon: "truck" },
    { title: "Secure Payment", description: "100% secure checkout", icon: "shield" },
    { title: "Fast Delivery", description: "2-3 business days", icon: "clock" },
    { title: "Easy Returns", description: "30-day return policy", icon: "creditCard" },
  ],
  layout = "horizontal",
  backgroundColor,
  titleColor,
  textColor,
  accentColor = "#3b82f6",
  animationStyle = "theme",
  theme = "simple",
}: FeaturesProps) {
  const animation = getAnimation(animationStyle, theme);

  return (
    <section
      className={styles.features}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={styles.container}>
        {(title || subtitle) && (
          <motion.div {...animation} className={styles.header}>
            {title && (
              <h2 className={styles.title} style={{ color: titleColor || undefined }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={styles.subtitle} style={{ color: textColor || undefined }}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={`${styles.grid} ${layout === "horizontal" ? styles.horizontal : styles.gridLayout}`}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon ? iconMap[feature.icon] || Zap : Zap;
            
            return (
              <motion.div
                key={index}
                {...animation}
                transition={{ ...animation.transition, delay: index * 0.1 }}
                className={styles.feature}
              >
                <div
                  className={styles.iconWrapper}
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  <IconComponent size={24} />
                </div>
                <div className={styles.content}>
                  {feature.value && (
                    <span className={styles.value} style={{ color: accentColor }}>
                      {feature.value}
                    </span>
                  )}
                  <h3 className={styles.featureTitle} style={{ color: titleColor || undefined }}>
                    {feature.title}
                  </h3>
                  {feature.description && (
                    <p className={styles.description} style={{ color: textColor || undefined }}>
                      {feature.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
