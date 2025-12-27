"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { getAnimation } from "../../lib/animation-config";
import styles from "./Countdown.module.css";

interface CountdownProps {
  title?: string;
  subtitle?: string;
  endDate?: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  animationStyle?: string;
  theme?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({
  title = "Sale Ends In",
  subtitle = "Don't miss out on these amazing deals!",
  endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  linkText = "Shop Sale",
  linkUrl = "/products",
  backgroundColor,
  titleColor,
  textColor,
  accentColor = "#ef4444",
  animationStyle = "theme",
  theme = "simple",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const animation = getAnimation(animationStyle, theme);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <section
        className={styles.countdown}
        style={{ backgroundColor: backgroundColor || undefined }}
      >
        <div className={styles.container}>
          <motion.div {...animation} className={styles.expired}>
            <p className={styles.expiredText} style={{ color: textColor || undefined }}>
              This offer has ended
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  const timeBlocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <section
      className={styles.countdown}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={styles.container}>
        <motion.div {...animation} className={styles.header}>
          <Clock size={32} style={{ color: accentColor }} className={styles.icon} />
          <h2 className={styles.title} style={{ color: titleColor || undefined }}>
            {title}
          </h2>
          {subtitle && (
            <p className={styles.subtitle} style={{ color: textColor || undefined }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div {...animation} className={styles.timer}>
          {timeBlocks.map((block, index) => (
            <React.Fragment key={block.label}>
              <div className={styles.timeBlock}>
                <div
                  className={styles.value}
                  style={{ backgroundColor: accentColor, color: "#ffffff" }}
                >
                  {String(block.value).padStart(2, "0")}
                </div>
                <span className={styles.label} style={{ color: textColor || undefined }}>
                  {block.label}
                </span>
              </div>
              {index < timeBlocks.length - 1 && (
                <span className={styles.separator} style={{ color: accentColor }}>
                  :
                </span>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {linkText && linkUrl && (
          <motion.a
            {...animation}
            href={linkUrl}
            className={styles.cta}
            style={{ backgroundColor: accentColor }}
          >
            {linkText}
          </motion.a>
        )}
      </div>
    </section>
  );
}
