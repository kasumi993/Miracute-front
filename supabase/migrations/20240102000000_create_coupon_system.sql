-- Create comprehensive coupon and discount system
-- This will significantly boost conversion rates and customer retention

-- Coupons table for discount codes
CREATE TABLE public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Discount configuration
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL, -- percentage (0-100) or fixed amount

    -- BXGY configuration (buy X get Y)
    buy_quantity INTEGER DEFAULT 1,
    get_quantity INTEGER DEFAULT 1,
    get_discount_percentage DECIMAL(5,2) DEFAULT 100, -- 100 = free, 50 = 50% off

    -- Usage limits
    usage_limit INTEGER, -- null = unlimited
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_customer INTEGER DEFAULT 1,

    -- Conditions
    minimum_order_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),

    -- Product/category restrictions
    applicable_products UUID[], -- null = all products
    applicable_categories UUID[], -- null = all categories
    excluded_products UUID[], -- specific exclusions

    -- Customer restrictions
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

-- Automatic discount rules (for dynamic promotions)
CREATE TABLE public.discount_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Trigger conditions
    trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('cart_value', 'item_quantity', 'category_spend', 'first_purchase', 'customer_segment')),
    trigger_value DECIMAL(10,2), -- threshold amount or quantity

    -- Discount action
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_product', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,

    -- Product/category scope
    applicable_products UUID[],
    applicable_categories UUID[],

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

-- Indexes for performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX idx_discount_rules_active ON public.discount_rules(is_active, valid_from, valid_until);

-- Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;

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

-- Grant permissions
GRANT ALL ON public.coupons TO service_role;
GRANT ALL ON public.coupon_usage TO service_role;
GRANT ALL ON public.discount_rules TO service_role;

-- Triggers for updated_at
CREATE TRIGGER handle_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_discount_rules_updated_at
    BEFORE UPDATE ON public.discount_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();