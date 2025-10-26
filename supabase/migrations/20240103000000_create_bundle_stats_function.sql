-- Create function to get bundle statistics
CREATE OR REPLACE FUNCTION public.get_bundle_stats()
RETURNS TABLE (
  total_bundles INTEGER,
  active_bundles INTEGER,
  total_savings DECIMAL(10,2),
  total_sales INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_bundles,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_bundles,
    COALESCE(SUM(discount_amount), 0)::DECIMAL(10,2) as total_savings,
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.bundle_sales
    ), 0) as total_sales
  FROM public.product_bundles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_bundle_stats() TO service_role;