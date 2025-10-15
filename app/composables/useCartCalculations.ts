import type { CartItem } from '@/types/commerce/cart'

export const useCartCalculations = () => {
  /**
   * Calculate cart subtotal
   */
  const calculateSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + parseFloat(String(item.price)), 0)
  }

  /**
   * Calculate tax amount
   */
  const calculateTax = (subtotal: number, taxRate = 0.0): number => {
    return subtotal * taxRate
  }


  /**
   * Calculate total including tax (no shipping for digital products)
   */
  const calculateTotal = (items: CartItem[], options?: {
    taxRate?: number
  }): {
    subtotal: number
    tax: number
    total: number
  } => {
    const { taxRate = 0.0 } = options || {}

    const subtotal = calculateSubtotal(items)
    const tax = calculateTax(subtotal, taxRate)
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total
    }
  }

  /**
   * Get cart summary for display/checkout
   */
  const getCartSummary = (items: CartItem[]) => {
    const calculations = calculateTotal(items)
    const itemCount = items.length // Each item is quantity 1

    return {
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.price,
        variant: item.selectedVariant
      })),
      ...calculations,
      itemCount
    }
  }

  return {
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    getCartSummary
  }
}