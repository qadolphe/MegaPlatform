import { ProductsAPI } from './products';
import { VariantsAPI } from './variants';
import { CartAPI } from './cart';
import { CheckoutAPI } from './checkout';
import { StoreAPI } from './store';
import { MediaAPI } from './media';
import { DBAPI } from './db';
import { OrdersAPI } from './orders';
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
 * // Use the Content Library
 * const images = await swat.media.list();
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
    public readonly variants: VariantsAPI;
    public readonly cart: CartAPI;
    public readonly checkout: CheckoutAPI;
    public readonly store: StoreAPI;
    public readonly media: MediaAPI;
    public readonly db: DBAPI;
    public readonly orders: OrdersAPI;

    private apiKey: string;
    private baseUrl: string;

    /**
     * Create a new SwatBloc client
     * 
     * @param apiKey - Your store's Public API key (pk_live_...) or Secret Key (sk_live_...)
     * @param config - Optional configuration
     */
    constructor(apiKey: string, config: SwatBlocConfig = {}) {
        this.apiKey = apiKey;
        this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;

        this.products = new ProductsAPI(this.apiKey, this.baseUrl);
        this.variants = new VariantsAPI(this.apiKey, this.baseUrl);
        this.cart = new CartAPI(this.apiKey, this.baseUrl);
        this.checkout = new CheckoutAPI(this.apiKey, this.baseUrl);
        this.store = new StoreAPI(this.apiKey, this.baseUrl);
        this.media = new MediaAPI(this.apiKey, this.baseUrl);
        this.db = new DBAPI(this.apiKey, this.baseUrl);
        this.orders = new OrdersAPI(this.apiKey, this.baseUrl);
    }
}

export default SwatBloc;
