# SwatBloc SDK

SDK for SwatBloc headless commerce - access products, cart, and checkout from any app.

## Installation

```bash
npm install @swatbloc/sdk
```

## Quick Start

```typescript
import { SwatBloc } from '@swatbloc/sdk';

const swat = new SwatBloc('pk_live_xxxxx');

// Get products
const products = await swat.products.list();

// Create cart
const cart = await swat.cart.create([
  { productId: 'prod_123', quantity: 1 }
]);

// Checkout
const checkout = await swat.checkout.create(cart.id, {
  successUrl: 'https://mysite.com/success',
  cancelUrl: 'https://mysite.com/cart'
});

window.location.href = checkout.url;
```

## Documentation

See [Cursor Rules](../.cursorrules) for full API documentation.

## Get Your API Keys

1. Go to your SwatBloc dashboard
2. Navigate to Settings → Developer
3. Generate a new API key
4. Use the public key (pk_live_...) in your app
