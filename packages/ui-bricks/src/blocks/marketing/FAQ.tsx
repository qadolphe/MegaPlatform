"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { getAnimation } from "../../lib/animation-config";
import styles from "./FAQ.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: string;
  theme?: string;
}

export function FAQ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know",
  items = [
    { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items. Simply contact our support team to initiate a return." },
    { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery." },
    { question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide. Shipping rates and times vary by location." },
    { question: "How can I track my order?", answer: "Once your order ships, you'll receive a tracking number via email to monitor your package's journey." },
  ],
  backgroundColor,
  titleColor,
  textColor,
  accentColor = "#3b82f6",
  animationStyle = "theme",
  theme = "simple",
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const animation = getAnimation(animationStyle, theme);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className={styles.faq}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={styles.container}>
        <motion.div {...animation} className={styles.header}>
          <HelpCircle size={40} style={{ color: accentColor }} className={styles.icon} />
          <h2 className={styles.title} style={{ color: titleColor || undefined }}>
            {title}
          </h2>
          {subtitle && (
            <p className={styles.subtitle} style={{ color: textColor || undefined }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className={styles.list}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ ...animation.transition, delay: index * 0.05 }}
              className={styles.item}
            >
              <button
                className={styles.question}
                onClick={() => toggleItem(index)}
                style={{ color: titleColor || undefined }}
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`${styles.chevron} ${openIndex === index ? styles.open : ""}`}
                  style={{ color: accentColor }}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.answerWrapper}
                  >
                    <p className={styles.answer} style={{ color: textColor || undefined }}>
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
