import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define what a "Product" looks like in your cart
export interface CartItem {
  id: string
  name: string
  price: number // Store in cents (e.g., $10.00 = 1000) to avoid math errors
  quantity: number
  image?: string
  // For your specific app: is this a kit or a service?
  type: 'kit' | 'service' 
  slug: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  // Computed values
  totalPrice: () => number
}

// Create the store with persistence (saves to localStorage automatically)
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((i) => i.id === newItem.id)
        if (existingItem) {
          // If item exists, just bump quantity
          return {
            items: state.items.map((i) =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true // Open cart when adding item
          }
        }
        return { 
            items: [...state.items, { ...newItem, quantity: 1 }],
            isOpen: true // Open cart when adding item
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
            return {
                items: state.items.filter((i) => i.id !== id)
            }
        }
        return {
            items: state.items.map((i) =>
                i.id === id ? { ...i, quantity } : i
            ),
        }
      }),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      }
    }),
    {
      name: 'hoodie-cart-storage', // unique name for localStorage
    }
  )
)
