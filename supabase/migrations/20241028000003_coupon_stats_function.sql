-- Create function to get coupon statistics
CREATE OR REPLACE FUNCTION public.get_coupon_stats()
RETURNS TABLE (
  total_coupons INTEGER,
  active_coupons INTEGER,
  total_savings DECIMAL(10,2),
  total_usages INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_coupons,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_coupons,
    COALESCE(SUM(
      CASE
        WHEN usage_count > 0 THEN
          (SELECT COALESCE(SUM(discount_amount), 0)
           FROM coupon_usages cu
           WHERE cu.coupon_id = c.id)
        ELSE 0
      END
    ), 0)::DECIMAL(10,2) as total_savings,
    COALESCE(SUM(usage_count), 0)::INTEGER as total_usages
  FROM public.coupons c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_coupon_stats() TO service_role;