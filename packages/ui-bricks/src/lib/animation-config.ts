
export type AnimationTheme = 'simple' | 'playful' | 'elegant' | 'dynamic' | 'none';

interface ThemeConfig {
    variant: string;
    duration: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hover?: any;
}

export const ANIMATION_THEMES: Record<AnimationTheme, ThemeConfig> = {
  simple: { 
      variant: 'fadeUp', 
      duration: 0.6,
      transition: { ease: [0.25, 0.1, 0.25, 1] },
      hover: { y: -5, transition: { duration: 0.2 } }
  },
  playful: { 
      variant: 'scaleUp', 
      duration: 0.5,
      transition: { type: "spring", stiffness: 300, damping: 15 },
      hover: { scale: 1.05, rotate: 1, transition: { type: "spring", stiffness: 400, damping: 10 } }
  },
  elegant: { 
      variant: 'fadeIn', 
      duration: 1.5,
      transition: { ease: "easeInOut" },
      hover: { scale: 1.02, filter: "brightness(1.05)", transition: { duration: 0.4 } }
  },
  dynamic: { 
      variant: 'slideRight', 
      duration: 0.5,
      transition: { type: "spring", stiffness: 120, damping: 14 },
      hover: { x: 5, skewX: -2, transition: { duration: 0.2 } }
  },
  none: { 
      variant: 'none', 
      duration: 0,
      hover: {}
  },
};

export const getAnimationConfig = (theme: string) => {
  return ANIMATION_THEMES[theme as AnimationTheme] || ANIMATION_THEMES.simple;
};
