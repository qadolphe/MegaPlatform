
import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './Hero';

const meta = {
    title: 'Marketing/Hero',
    component: Hero,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Welcome to Our Store',
        subtitle: 'Discover amazing products crafted just for you.',
        primaryCtaText: 'Shop Now',
        primaryCtaLink: '#',
        secondaryCtaText: 'Learn More',
        secondaryCtaLink: '#',
    },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
    args: {
        backgroundImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
        titleColor: '#ffffff',
        subtitleColor: '#f0f0f0',
        overlayColor: 'rgba(0,0,0,0.5)',
    },
};

export const ElegantTheme: Story = {
    args: {
        title: 'Collection 2024',
        subtitle: 'Elegant designs for modern living.',
        animationStyle: 'elegant',
        titleColor: '#1a1a1a',
    }
}
