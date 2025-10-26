-- Add type field to distinguish between coupons and promotions
-- Coupons: require customer to enter code at checkout
-- Promotions: automatically applied site-wide when active

ALTER TABLE public.coupons
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'promotion'
CHECK (type IN ('coupon', 'promotion'));

-- Add index for better performance when filtering by type
CREATE INDEX idx_coupons_type ON public.coupons(type);

-- Add index for filtering active promotions (most common query)
CREATE INDEX idx_coupons_active_promotions ON public.coupons(type, is_active)
WHERE type = 'promotion' AND is_active = true;

-- Update existing records to be promotions by default
UPDATE public.coupons SET type = 'promotion' WHERE type IS NULL;