"use client";

interface SpacerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    mobileSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const SIZES: Record<string, string> = {
    'xs': '1rem',
    'sm': '2rem',
    'md': '4rem',
    'lg': '6rem',
    'xl': '8rem',
    '2xl': '10rem',
    '3xl': '12rem'
};

export const Spacer = ({
    size = 'md',
    mobileSize
}: SpacerProps) => {
    const desktopHeight = SIZES[size] || SIZES.md;
    const mobileHeight = mobileSize ? SIZES[mobileSize] : `calc(${desktopHeight} * 0.6)`;

    return (
        <div
            className="spacer-component"
            style={{
                height: desktopHeight,
                width: '100%',
                ['--mobile-height' as string]: mobileHeight
            }}
        />
    );
};
