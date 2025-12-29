
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta = {
    title: 'Layout/Header',
    component: Header,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        logoText: 'MegaStore',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
        ],
        showCart: true,
    },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
    args: {
        centered: true,
    },
};

export const DarkMode: Story = {
    args: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
    },
    parameters: {
        backgrounds: { default: 'dark' },
    }
};
