"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, ArrowRight, Tag, Zap } from "lucide-react";
import { getAnimation } from "../../lib/animation-config";
import styles from "./Banner.module.css";

interface BannerProps {
  text?: string;
  linkText?: string;
  linkUrl?: string;
  icon?: "tag" | "zap" | "none";
  dismissible?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: string;
  theme?: string;
}

export function Banner({
  text = "🎉 Free shipping on orders over $50!",
  linkText = "Shop Now",
  linkUrl = "/products",
  icon = "tag",
  dismissible = true,
  backgroundColor = "#0f172a",
  textColor = "#ffffff",
  accentColor = "#fbbf24",
  animationStyle = "theme",
  theme = "simple",
}: BannerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const animation = getAnimation(animationStyle, theme);

  if (dismissed) return null;

  const IconComponent = icon === "tag" ? Tag : icon === "zap" ? Zap : null;

  return (
    <motion.section
      {...animation}
      className={styles.banner}
      style={{ backgroundColor }}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {IconComponent && (
            <IconComponent size={18} style={{ color: accentColor }} />
          )}
          <p className={styles.text} style={{ color: textColor }}>
            {text}
          </p>
          {linkText && linkUrl && (
            <a
              href={linkUrl}
              className={styles.link}
              style={{ color: accentColor }}
            >
              {linkText}
              <ArrowRight size={14} />
            </a>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className={styles.dismiss}
            style={{ color: textColor }}
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </motion.section>
  );
}
