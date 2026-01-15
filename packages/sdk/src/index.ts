import { ProductsAPI } from './products';
import { CartAPI } from './cart';
import { CheckoutAPI } from './checkout';
import { StoreAPI } from './store';
import { DBAPI } from './db';
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
 * // Use Custom DB
 * const logs = await swat.db.collection('liability-logs').list();
 * 
 * // Create a cart
 * const cart = await swat.cart.create([
 *   { productId: 'prod_123', quantity: 1 }
 * ]);
 * ```
 */
export class SwatBloc {
    public readonly products: ProductsAPI;
    public readonly cart: CartAPI;
    public readonly checkout: CheckoutAPI;
    public readonly store: StoreAPI;
    public readonly db: DBAPI;

    private publicKey: string;
    private baseUrl: string;

    /**
     * Create a new SwatBloc client
     * 
     * @param publicKey - Your store's public API key (pk_live_...)
     * @param config - Optional configuration
     */
    constructor(publicKey: string, config: SwatBlocConfig = {}) {
        this.publicKey = publicKey;
        this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;

        this.products = new ProductsAPI(this.publicKey, this.baseUrl);
        this.cart = new CartAPI(this.publicKey, this.baseUrl);
        this.checkout = new CheckoutAPI(this.publicKey, this.baseUrl);
        this.store = new StoreAPI(this.publicKey, this.baseUrl);
        this.db = new DBAPI(this.publicKey, this.baseUrl);
    }
}

export default SwatBloc;
