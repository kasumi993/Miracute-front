-- Create digital-focused coupon and bundle system
-- Optimized for digital products where quantity is always 1 per product

-- Simplified coupons table for digital products
CREATE TABLE public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Discount configuration (simplified for digital products)
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL, -- percentage (0-100) or fixed amount

    -- Usage limits
    usage_limit INTEGER, -- null = unlimited
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_customer INTEGER DEFAULT 1,

    -- Cart value conditions (key for digital products)
    minimum_cart_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),

    -- Product/category targeting
    applicable_products UUID[], -- null = all products
    applicable_categories UUID[], -- null = all categories
    excluded_products UUID[], -- specific exclusions

    -- Customer targeting
    customer_eligibility VARCHAR(20) DEFAULT 'all' CHECK (customer_eligibility IN ('all', 'new_customers', 'returning_customers', 'vip_customers')),
    applicable_customer_emails TEXT[], -- specific customer targeting

    -- Time restrictions
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    valid_until TIMESTAMP WITH TIME ZONE,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Coupon usage tracking
CREATE TABLE public.coupon_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    customer_email VARCHAR(255) NOT NULL,

    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,

    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(coupon_id, order_id)
);

-- Product bundles system for "buy together" functionality
CREATE TABLE public.product_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Bundle pricing
    bundle_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL, -- Sum of individual product prices
    discount_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - bundle_price) STORED,
    discount_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN original_price > 0 THEN ((original_price - bundle_price) / original_price * 100)
            ELSE 0
        END
    ) STORED,

    -- Bundle configuration
    products UUID[] NOT NULL, -- Array of product IDs in this bundle
    is_active BOOLEAN DEFAULT true,

    -- Display settings
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,

    -- SEO and marketing
    slug VARCHAR(100) UNIQUE,
    meta_title VARCHAR(160),
    meta_description VARCHAR(300),

    -- Images
    featured_image TEXT,
    gallery_images TEXT[],

    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bundle sales tracking
CREATE TABLE public.bundle_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    customer_email VARCHAR(255) NOT NULL,

    bundle_price DECIMAL(10,2) NOT NULL,
    savings_amount DECIMAL(10,2) NOT NULL,

    sold_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automatic discount rules (cart value based)
CREATE TABLE public.discount_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Trigger conditions (focused on cart value for digital products)
    trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('cart_value', 'category_spend', 'first_purchase', 'customer_segment', 'product_count')),
    trigger_value DECIMAL(10,2), -- threshold amount or product count

    -- Discount action
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_product')),
    discount_value DECIMAL(10,2) NOT NULL,

    -- Free product for high-value carts
    free_product_id UUID REFERENCES public.products(id),

    -- Scope limitations
    applicable_products UUID[],
    applicable_categories UUID[],
    minimum_cart_value DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),

    -- Time and usage limits
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- higher priority rules apply first

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bundle recommendation engine data
CREATE TABLE public.bundle_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    primary_product_id UUID NOT NULL,
    recommended_bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,

    -- Recommendation scoring
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    conversion_rate DECIMAL(5,4) DEFAULT 0.0,

    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(primary_product_id, recommended_bundle_id)
);

-- Indexes for performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX idx_discount_rules_active ON public.discount_rules(is_active, valid_from, valid_until);
CREATE INDEX idx_product_bundles_active ON public.product_bundles(is_active, featured);
CREATE INDEX idx_product_bundles_slug ON public.product_bundles(slug);
CREATE INDEX idx_bundle_sales_bundle_id ON public.bundle_sales(bundle_id);
CREATE INDEX idx_bundle_recommendations_product ON public.bundle_recommendations(primary_product_id, is_active);

-- Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for coupons (public read for active coupons, admin write)
CREATE POLICY "Anyone can view active coupons" ON public.coupons
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Service role can manage coupons" ON public.coupons
    FOR ALL USING (true);

-- Policies for coupon usage (users can see their own usage)
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage coupon usage" ON public.coupon_usage
    FOR ALL USING (true);

-- Policies for discount rules (public read for active rules, admin write)
CREATE POLICY "Anyone can view active discount rules" ON public.discount_rules
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Service role can manage discount rules" ON public.discount_rules
    FOR ALL USING (true);

-- Policies for product bundles (public read for active bundles, admin write)
CREATE POLICY "Anyone can view active bundles" ON public.product_bundles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage bundles" ON public.product_bundles
    FOR ALL USING (true);

-- Policies for bundle sales (users can see their own purchases)
CREATE POLICY "Users can view own bundle purchases" ON public.bundle_sales
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage bundle sales" ON public.bundle_sales
    FOR ALL USING (true);

-- Policies for bundle recommendations (public read, admin write)
CREATE POLICY "Anyone can view active bundle recommendations" ON public.bundle_recommendations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage bundle recommendations" ON public.bundle_recommendations
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.coupons TO service_role;
GRANT ALL ON public.coupon_usage TO service_role;
GRANT ALL ON public.discount_rules TO service_role;
GRANT ALL ON public.product_bundles TO service_role;
GRANT ALL ON public.bundle_sales TO service_role;
GRANT ALL ON public.bundle_recommendations TO service_role;

-- Triggers for updated_at
CREATE TRIGGER handle_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_discount_rules_updated_at
    BEFORE UPDATE ON public.discount_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_product_bundles_updated_at
    BEFORE UPDATE ON public.product_bundles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bundle_recommendations_updated_at
    BEFORE UPDATE ON public.bundle_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();