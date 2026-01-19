# SwatBloc SDK

The official specific SDK for SwatBloc headless commerce. Access products, manage carts, handle checkout, and use custom databases directly from your frontend or backend application.

## Installation

```bash
npm install @swatbloc/sdk
```

## Quick Start

Initialize the client with your store's Public Key.

```typescript
import { SwatBloc } from '@swatbloc/sdk';

// Initialize with your Public Key
const swat = new SwatBloc('pk_live_xxxxx');
```

---

## Features

### 🛒 Commerce
Manage standard e-commerce flows.

```typescript
// 1. List Products
const products = await swat.products.list({ limit: 10 });

// 2. Create Cart
const cart = await swat.cart.create([
  { productId: products[0].id, quantity: 1 }
]);

// 3. Checkout (Stripe Direct Charge)
// The user pays YOU directly. SwatBloc takes a platform fee automatically.
const checkout = await swat.checkout.create(cart.id, {
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cart'
});

// Redirect user to Stripe
window.location.href = checkout.url;
```

### 💾 Custom Databases (Virtual Tables)
Store structured data specific to your application (reviews, liability logs, customer preferences, etc.) without managing a separate backend.

#### 1. Define Your Schema
You can define schemas programmatically (ideal for migrations or AI agents). This operation is **idempotent** (safe to run on every startup).

```typescript
// Create a "Liability Waiver" collection
await swat.db.createModel(
  'Liability Waiver', // Display Name
  'liability-waivers', // Slug (Table Name)
  {
    fields: [
      { key: 'customer_email', type: 'text', required: true },
      { key: 'signed_at', type: 'date', required: true },
      { key: 'order_id', type: 'reference' }, // Links to external IDs
      { key: 'photo_evidence', type: 'image' }
    ]
  }
);
```

#### 2. Write Data
Data is automatically validated against your schema before saving.

```typescript
const waiver = await swat.db.collection('liability-waivers').create({
  customer_email: 'john@example.com',
  signed_at: new Date().toISOString(),
  order_id: 'ord_123',
  photo_evidence: 'https://site-assets.swatbloc.com/signatures/sign_1.png'
});
```

#### 3. Query Data
Filter your custom data.

```typescript
const logs = await swat.db.collection('liability-waivers').list({
  limit: 5,
  filter: {
    customer_email: 'john@example.com'
  }
});
```

### 📦 Orders (Admin)
Manage and track orders. **Requires Secret Key** (`sk_live_...`).

```typescript
// Initialize with Secret Key
const swatAdmin = new SwatBloc('sk_live_xxxxx');

// 1. List Orders
const orders = await swatAdmin.orders.list({ status: 'pending' });

// 2. Get Order Details
const order = await swatAdmin.orders.get('order_123');

// 3. Update Status
await swatAdmin.orders.update('order_123', {
  status: 'shipped',
  fulfillment_status: 'fulfilled'
});
```

---

## Type Safety
The SDK is fully typed.

```typescript
import { Product, Cart, ContentItem } from '@swatbloc/sdk';
```

## Get Your API Keys

1. Go to your SwatBloc dashboard: https://swatbloc.com
2. Navigate to **Settings** → **Developer**
3. Generate a new API key
4. Use the public key (`pk_live_...`) in your app

:)