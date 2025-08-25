export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'admin'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          seo_title: string | null
          seo_description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: string
          compare_at_price: string | null
          category_id: string | null
          preview_images: string[] | null
          download_files: string[] | null
          file_size: string | null
          file_formats: string[] | null
          seo_title: string | null
          seo_description: string | null
          meta_keywords: string[] | null
          tags: string[] | null
          difficulty_level: string | null
          software_required: string[] | null
          dimensions: string | null
          is_active: boolean
          is_featured: boolean
          stock_quantity: number
          view_count: number
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: string
          compare_at_price?: string | null
          category_id?: string | null
          preview_images?: string[] | null
          download_files?: string[] | null
          file_size?: string | null
          file_formats?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          meta_keywords?: string[] | null
          tags?: string[] | null
          difficulty_level?: string | null
          software_required?: string[] | null
          dimensions?: string | null
          is_active?: boolean
          is_featured?: boolean
          stock_quantity?: number
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: string
          compare_at_price?: string | null
          category_id?: string | null
          preview_images?: string[] | null
          download_files?: string[] | null
          file_size?: string | null
          file_formats?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          meta_keywords?: string[] | null
          tags?: string[] | null
          difficulty_level?: string | null
          software_required?: string[] | null
          dimensions?: string | null
          is_active?: boolean
          is_featured?: boolean
          stock_quantity?: number
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: string
          tax_amount: string
          discount_amount: string
          total_amount: string
          stripe_payment_intent_id: string | null
          payment_method: string | null
          customer_email: string
          customer_name: string | null
          billing_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: string
          tax_amount?: string
          discount_amount?: string
          total_amount: string
          stripe_payment_intent_id?: string | null
          payment_method?: string | null
          customer_email: string
          customer_name?: string | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal?: string
          tax_amount?: string
          discount_amount?: string
          total_amount?: string
          stripe_payment_intent_id?: string | null
          payment_method?: string | null
          customer_email?: string
          customer_name?: string | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          unit_price: string
          quantity: number
          total_price: string
          download_url: string | null
          download_expires_at: string | null
          download_count: number
          max_downloads: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          unit_price: string
          quantity?: number
          total_price: string
          download_url?: string | null
          download_expires_at?: string | null
          download_count?: number
          max_downloads?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_slug?: string
          unit_price?: string
          quantity?: number
          total_price?: string
          download_url?: string | null
          download_expires_at?: string | null
          download_count?: number
          max_downloads?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      download_logs: {
        Row: {
          id: string
          order_item_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          order_item_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          order_item_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'customer' | 'admin'
      order_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional type definitions for better development experience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductReview = Tables<'product_reviews'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type CartItem = Tables<'cart_items'>
export type Wishlist = Tables<'wishlists'>
export type DownloadLog = Tables<'download_logs'>

// Extended types with relations
export type ProductWithCategory = Product & {
  category: Category | null
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    product: Product
  })[]
}

export type CartItemWithProduct = CartItem & {
  product: Product
}

export type ProductWithReviews = Product & {
  reviews: (ProductReview & {
    user: User
  })[]
  category: Category | null
}

// Search and filter types
export interface ProductSearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  search?: string
  difficulty?: string
  software?: string[]
  featured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular' | 'rating'
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface SearchResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CheckoutSession {
  id: string
  url: string
  customer_email: string
}

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}