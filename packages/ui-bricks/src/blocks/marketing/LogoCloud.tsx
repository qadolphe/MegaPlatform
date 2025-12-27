"use client";

import React from "react";
import { motion } from "framer-motion";
import { getAnimation } from "../../lib/animation-config";
import styles from "./LogoCloud.module.css";

interface Logo {
  name: string;
  image: string;
  url?: string;
}

interface LogoCloudProps {
  title?: string;
  subtitle?: string;
  logos?: Logo[];
  grayscale?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  animationStyle?: string;
  theme?: string;
}

export function LogoCloud({
  title = "Trusted by leading brands",
  subtitle,
  logos = [
    { name: "Company 1", image: "https://via.placeholder.com/150x50?text=Logo+1" },
    { name: "Company 2", image: "https://via.placeholder.com/150x50?text=Logo+2" },
    { name: "Company 3", image: "https://via.placeholder.com/150x50?text=Logo+3" },
    { name: "Company 4", image: "https://via.placeholder.com/150x50?text=Logo+4" },
    { name: "Company 5", image: "https://via.placeholder.com/150x50?text=Logo+5" },
  ],
  grayscale = true,
  backgroundColor,
  titleColor,
  textColor,
  animationStyle = "theme",
  theme = "simple",
}: LogoCloudProps) {
  const animation = getAnimation(animationStyle, theme);

  return (
    <section
      className={styles.logoCloud}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={styles.container}>
        {title && (
          <motion.div {...animation} className={styles.header}>
            <h2 className={styles.title} style={{ color: titleColor || undefined }}>
              {title}
            </h2>
            {subtitle && (
              <p className={styles.subtitle} style={{ color: textColor || undefined }}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={styles.grid}>
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ ...animation.transition, delay: index * 0.05 }}
              className={styles.logoWrapper}
            >
              {logo.url ? (
                <a
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.logoLink}
                >
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className={`${styles.logo} ${grayscale ? styles.grayscale : ""}`}
                  />
                </a>
              ) : (
                <img
                  src={logo.image}
                  alt={logo.name}
                  className={`${styles.logo} ${grayscale ? styles.grayscale : ""}`}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
