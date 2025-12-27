"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { getAnimation } from "../../lib/animation-config";
import styles from "./Testimonials.module.css";

interface Testimonial {
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  columns?: number;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: string;
  theme?: string;
}

export function Testimonials({
  title = "What Our Customers Say",
  subtitle = "Real reviews from real customers",
  testimonials = [
    { name: "Sarah J.", role: "Verified Buyer", content: "Absolutely love the quality! Will definitely be ordering again.", rating: 5 },
    { name: "Mike R.", role: "Repeat Customer", content: "Best purchase I've made this year. Fast shipping and great customer service.", rating: 5 },
    { name: "Emily K.", role: "Verified Buyer", content: "The attention to detail is incredible. Highly recommend!", rating: 4 },
  ],
  columns = 3,
  backgroundColor,
  titleColor,
  textColor,
  accentColor = "#3b82f6",
  animationStyle = "theme",
  theme = "simple",
}: TestimonialsProps) {
  const animation = getAnimation(animationStyle, theme);

  return (
    <section
      className={styles.testimonials}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={styles.container}>
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

        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))` }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ ...animation.transition, delay: index * 0.1 }}
              className={styles.card}
              style={{
                borderColor: accentColor,
              }}
            >
              <Quote
                size={32}
                className={styles.quoteIcon}
                style={{ color: accentColor }}
              />
              
              <p className={styles.content} style={{ color: textColor || undefined }}>
                {testimonial.content}
              </p>

              {testimonial.rating && (
                <div className={styles.rating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < testimonial.rating! ? "#fbbf24" : "transparent"}
                      stroke={i < testimonial.rating! ? "#fbbf24" : "#d1d5db"}
                    />
                  ))}
                </div>
              )}

              <div className={styles.author}>
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className={styles.avatar}
                  />
                ) : (
                  <div
                    className={styles.avatarPlaceholder}
                    style={{ backgroundColor: accentColor }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className={styles.name} style={{ color: titleColor || undefined }}>
                    {testimonial.name}
                  </p>
                  {testimonial.role && (
                    <p className={styles.role} style={{ color: textColor || undefined }}>
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
