-- Analytics tables for coupons and bundles
-- These tables store historical usage data separate from operational data

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID, -- References orders table, but don't enforce FK for flexibility
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  original_cart_amount DECIMAL(10,2),
  final_cart_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Bundle sales tracking
CREATE TABLE IF NOT EXISTS bundle_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES product_bundles(id) ON DELETE SET NULL,
  bundle_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID, -- References orders table, but don't enforce FK for flexibility
  bundle_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store product IDs and details at time of sale
  sold_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_code ON coupon_usages(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_created_at ON coupon_usages(created_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON coupon_usages(order_id);

CREATE INDEX IF NOT EXISTS idx_bundle_sales_bundle_id ON bundle_sales(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_sales_sold_at ON bundle_sales(sold_at);
CREATE INDEX IF NOT EXISTS idx_bundle_sales_user_id ON bundle_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_sales_order_id ON bundle_sales(order_id);

-- RLS policies (admin only)
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_sales ENABLE ROW LEVEL SECURITY;

-- Grant access to service role for API operations
GRANT ALL ON coupon_usages TO service_role;
GRANT ALL ON bundle_sales TO service_role;

-- Grant read access to authenticated users for their own data
GRANT SELECT ON coupon_usages TO authenticated;
GRANT SELECT ON bundle_sales TO authenticated;

-- Users can only see their own usage data
CREATE POLICY "Users can view their own coupon usages" ON coupon_usages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own bundle purchases" ON bundle_sales
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role can do everything (for admin analytics)
CREATE POLICY "Service role full access to coupon_usages" ON coupon_usages
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role full access to bundle_sales" ON bundle_sales
  FOR ALL TO service_role
  USING (true);