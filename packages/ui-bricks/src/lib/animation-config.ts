
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
        hover: { y: -4, transition: { duration: 0.2 } }
    },
    playful: {
        variant: 'scaleUp',
        duration: 0.5,
        transition: { type: "spring", stiffness: 200, damping: 20 },
        hover: { scale: 1.03, rotate: 0.5, transition: { type: "spring", stiffness: 300, damping: 15 } }
    },
    elegant: {
        variant: 'fadeIn',
        duration: 1.2,
        transition: { ease: "easeInOut" },
        hover: { scale: 1.01, filter: "brightness(1.03)", transition: { duration: 0.4 } }
    },
    dynamic: {
        variant: 'slideRight',
        duration: 0.6,
        transition: { type: "spring", stiffness: 100, damping: 18 },
        hover: { x: 3, transition: { duration: 0.2 } }
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

export const getAnimation = (style: string = 'theme', theme: string = 'simple') => {
    const effectiveTheme = style === 'theme' ? theme : style;
    const config = getAnimationConfig(effectiveTheme);

    if (effectiveTheme === 'none') return {};

    const variants = {
        hidden: {
            opacity: 0,
            y: config.variant === "fadeUp" ? 20 : 0,
            x: config.variant === "slideRight" ? -20 : config.variant === "slideLeft" ? 20 : 0,
            scale: config.variant === "scaleUp" ? 0.95 : 1,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration: config.duration,
                ...config.transition
            }
        }
    };

    return {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "-50px" },
        variants: variants,
        transition: { duration: config.duration }
    };
};

