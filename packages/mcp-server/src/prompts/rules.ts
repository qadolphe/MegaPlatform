import { McpPrompt } from "../common/types.js";

const PROJECT_RULES_CONTENT = `
# SwatBloc SDK - Cursor Rules

You are building an app that uses the SwatBloc SDK for headless commerce.

## Installation

\`\`\`bash
npm install @swatbloc/sdk
\`\`\`

## Initialization

\`\`\`typescript
import { SwatBloc } from '@swatbloc/sdk';

// Initialize with your public API key from SwatBloc dashboard
const swat = new SwatBloc('pk_live_YOUR_KEY_HERE');
\`\`\`

## API Reference

### Products

\`\`\`typescript
// List all products
const products = await swat.products.list();

// List with options  
const products = await swat.products.list({
  limit: 10,
  offset: 0,
  category: 'shoes',
  search: 'running'
});

// Get single product by ID or slug
const product = await swat.products.get('prod_123');
const product = await swat.products.get('blue-running-shoes');

// Get by category
const shoes = await swat.products.byCategory('shoes');

// Search products
const results = await swat.products.search('running shoes');
\`\`\`

### Cart

\`\`\`typescript
// Create a cart
const cart = await swat.cart.create([
  { productId: 'prod_123', quantity: 2 },
  { productId: 'prod_456', quantity: 1 }
]);

// Get existing cart
const cart = await swat.cart.get('cart_abc123');

// Add items
const cart = await swat.cart.addItems('cart_abc123', [
  { productId: 'prod_789', quantity: 1 }
]);

// Update quantity
const cart = await swat.cart.updateItem('cart_abc123', 'prod_123', 3);

// Remove item
const cart = await swat.cart.removeItem('cart_abc123', 'prod_123');
\`\`\`

### Checkout

\`\`\`typescript
// Create checkout session (redirects to Stripe)
const checkout = await swat.checkout.create('cart_abc123', {
  successUrl: 'https://mysite.com/success',
  cancelUrl: 'https://mysite.com/cart'
});

// Redirect user to checkout
window.location.href = checkout.url;
\`\`\`

### Store Info

\`\`\`typescript
// Get store details
const store = await swat.store.info();
console.log(store.name);       // "My Store"
console.log(store.currency);   // "usd"
console.log(store.colors);     // { primary: "#3B82F6", ... }
\`\`\`

## Types

All responses are fully typed. Import types if needed:

\`\`\`typescript
import type { Product, Cart, CheckoutSession, StoreInfo } from '@swatbloc/sdk';
\`\`\`

## Error Handling

\`\`\`typescript
try {
  const product = await swat.products.get('invalid-id');
} catch (error) {
  console.error(error.message); // "Product not found: invalid-id"
}
\`\`\`

## Important Notes

- Always use the PUBLIC key (pk_live_...) in client-side code
- Never expose your SECRET key (sk_live_...) in frontend code
- Cart IDs persist across sessions - save them to localStorage
- Checkout URLs expire after 24 hours
`;

export const projectRulesPrompt: McpPrompt = {
    name: "project-rules",
    description: "Get the project rules and guidelines for SwatBloc SDK",
    execute: async () => PROJECT_RULES_CONTENT
};
