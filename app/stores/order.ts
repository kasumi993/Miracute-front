import { defineStore } from 'pinia'

export interface OrderItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  downloadUrl?: string
  templateId: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  savings: number
  customerEmail: string
  customerName: string
  paymentIntentId?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isProcessingPayment: boolean
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    isProcessingPayment: false
  }),

  getters: {
    completedOrders: (state) => state.orders.filter(order => order.status === 'completed'),

    getOrderById: (state) => (orderId: string) =>
      state.orders.find(order => order.id === orderId),

    getCurrentOrderDownloads: (state) => {
      if (!state.currentOrder) {return []}
      return state.currentOrder.items.filter(item => item.downloadUrl)
    }
  },

  actions: {
    async createOrder(cartItems: any[], customerData: {
      email: string
      firstName: string
      lastName: string
    }) {
      const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: item.quantity,
          templateId: item.id,
          downloadUrl: item.downloadUrl
        })),
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        savings: cartItems.reduce((sum, item) => {
          const originalPrice = item.originalPrice || item.price
          return sum + ((originalPrice - item.price) * item.quantity)
        }, 0),
        customerEmail: customerData.email,
        customerName: `${customerData.firstName} ${customerData.lastName}`,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.currentOrder = order
      return order
    },

    async processPayment(order: Order, paymentData: any = {}) {
      this.isProcessingPayment = true

      try {
        // Here you would integrate with Stripe
        // For now, simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Update order with payment info
        order.paymentIntentId = paymentData.paymentIntentId || `pi_${Date.now()}`
        order.status = 'completed'
        order.updatedAt = new Date()

        // Save order to database
        await this.saveOrderToDatabase(order)

        // Add to local orders
        this.orders.push(order)

        return { success: true, order }
      } catch (error) {
        order.status = 'failed'
        order.updatedAt = new Date()

        return { success: false, error: error.message }
      } finally {
        this.isProcessingPayment = false
      }
    },

    async saveOrderToDatabase(order: Order) {
      const supabase = useSupabaseClient()

      try {
        // Save main order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: order.id,
            customer_email: order.customerEmail,
            customer_name: order.customerName,
            total_amount: order.total,
            savings_amount: order.savings,
            payment_intent_id: order.paymentIntentId,
            status: order.status,
            created_at: order.createdAt.toISOString(),
            updated_at: order.updatedAt.toISOString()
          })
          .select()
          .single()

        if (orderError) {throw orderError}

        // Save order items
        const orderItems = order.items.map(item => ({
          order_id: order.id,
          template_id: item.templateId,
          product_name: item.name,
          product_slug: item.slug,
          price: item.price,
          quantity: item.quantity,
          download_url: item.downloadUrl
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {throw itemsError}

        return orderData
      } catch (error) {
        console.error('Failed to save order to database:', error)
        throw error
      }
    },

    async loadUserOrders(userEmail: string) {
      const supabase = useSupabaseClient()

      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              templates (
                name,
                slug,
                download_url
              )
            )
          `)
          .eq('customer_email', userEmail)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })

        if (error) {throw error}

        this.orders = orders.map(order => ({
          id: order.id,
          items: order.order_items.map(item => ({
            id: item.template_id,
            name: item.product_name,
            slug: item.product_slug,
            price: item.price,
            quantity: item.quantity,
            templateId: item.template_id,
            downloadUrl: item.templates?.download_url || item.download_url
          })),
          total: order.total_amount,
          savings: order.savings_amount,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          paymentIntentId: order.payment_intent_id,
          status: order.status,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at)
        }))

        return this.orders
      } catch (error) {
        console.error('Failed to load user orders:', error)
        return []
      }
    },

    clearCurrentOrder() {
      this.currentOrder = null
    },

    // Get all downloadable items for a user
    getAllUserDownloads() {
      const downloads = []
      this.completedOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.downloadUrl) {
            downloads.push({
              ...item,
              orderDate: order.createdAt,
              orderId: order.id
            })
          }
        })
      })
      return downloads
    }
  }
})
