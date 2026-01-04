import { ProductsAPI } from './products';
import { CartAPI } from './cart';
import { CheckoutAPI } from './checkout';
import { StoreAPI } from './store';
import { SwatBlocConfig } from './types';

export * from './types';

const DEFAULT_BASE_URL = 'https://api.swatbloc.com';

/**
 * SwatBloc SDK Client
 * 
 * @example
 * ```typescript
 * import { SwatBloc } from '@swatbloc/sdk';
 * 
 * const swat = new SwatBloc('pk_live_xxxxx');
 * 
 * // Get products
 * const products = await swat.products.list();
 * 
 * // Create a cart
 * const cart = await swat.cart.create([
 *   { productId: 'prod_123', quantity: 1 }
 * ]);
 * 
 * // Create checkout
 * const checkout = await swat.checkout.create(cart.id, {
 *   successUrl: 'https://mysite.com/success',
 *   cancelUrl: 'https://mysite.com/cart'
 * });
 * 
 * // Redirect to checkout
 * window.location.href = checkout.url;
 * ```
 */
export class SwatBloc {
    public readonly products: ProductsAPI;
    public readonly cart: CartAPI;
    public readonly checkout: CheckoutAPI;
    public readonly store: StoreAPI;

    private publicKey: string;
    private baseUrl: string;

    /**
     * Create a new SwatBloc client
     * 
     * @param publicKey - Your store's public API key (pk_live_...)
     * @param config - Optional configuration
     */
    constructor(publicKey: string, config: SwatBlocConfig = {}) {
        if (!publicKey) {
            throw new Error('SwatBloc: publicKey is required');
        }
        if (!publicKey.startsWith('pk_')) {
            throw new Error('SwatBloc: Invalid public key format. Must start with pk_');
        }

        this.publicKey = publicKey;
        this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;

        // Initialize API modules
        this.products = new ProductsAPI(this.publicKey, this.baseUrl);
        this.cart = new CartAPI(this.publicKey, this.baseUrl);
        this.checkout = new CheckoutAPI(this.publicKey, this.baseUrl);
        this.store = new StoreAPI(this.publicKey, this.baseUrl);
    }
}

export default SwatBloc;
