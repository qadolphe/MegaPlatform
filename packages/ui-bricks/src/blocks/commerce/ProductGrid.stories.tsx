
import type { Meta, StoryObj } from '@storybook/react';
import { ProductGrid } from './ProductGrid';

const dummyProducts = [
    { id: '1', name: 'Premium Leather Bag', price: 129.99, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', slug: 'bag' },
    { id: '2', name: 'Wireless Headphones', price: 199.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', slug: 'headphones' },
    { id: '3', name: 'Smart Watch', price: 299.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', slug: 'watch' },
    { id: '4', name: 'Sunglasses', price: 89.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', slug: 'glasses' },
];

const meta = {
    title: 'Commerce/ProductGrid',
    component: ProductGrid,
    parameters: {
        layout: 'padded',
    },
    args: {
        title: 'Featured Products',
        products: dummyProducts,
        columns: 4,
    },
} satisfies Meta<typeof ProductGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoColumns: Story = {
    args: {
        columns: 2,
    },
};

export const ExpandableLayout: Story = {
    args: {
        layout: 'expandable',
        products: [...dummyProducts, ...dummyProducts].map((p, i) => ({ ...p, id: `${p.id}-${i}` })), // More products
    }
}
