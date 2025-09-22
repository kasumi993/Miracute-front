-- Database functions for recommendation system
-- This file contains custom SQL functions for advanced e-commerce features

-- Function to get frequently bought together products
CREATE OR REPLACE FUNCTION get_frequently_bought_together(
  product_ids UUID[],
  min_frequency INTEGER DEFAULT 2
)
RETURNS TABLE (
  product_id UUID,
  frequency BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH order_combinations AS (
    SELECT DISTINCT
      o.id as order_id,
      oi1.product_id as base_product,
      oi2.product_id as related_product
    FROM orders o
    JOIN order_items oi1 ON o.id = oi1.order_id
    JOIN order_items oi2 ON o.id = oi2.order_id
    WHERE oi1.product_id = ANY(product_ids)
      AND oi2.product_id != oi1.product_id
      AND oi2.product_id != ALL(product_ids)
      AND o.payment_status = 'paid'
  )
  SELECT
    oc.related_product,
    COUNT(*) as frequency
  FROM order_combinations oc
  GROUP BY oc.related_product
  HAVING COUNT(*) >= min_frequency
  ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate customer lifetime value
CREATE OR REPLACE FUNCTION calculate_customer_ltv(
  customer_email TEXT,
  months_back INTEGER DEFAULT 12
)
RETURNS DECIMAL AS $$
DECLARE
  total_spent DECIMAL := 0;
  order_count INTEGER := 0;
  avg_order_value DECIMAL := 0;
  months_active INTEGER := 0;
  ltv DECIMAL := 0;
BEGIN
  -- Get customer spending data
  SELECT
    COALESCE(SUM(total_amount), 0),
    COUNT(*),
    COALESCE(AVG(total_amount), 0)
  INTO total_spent, order_count, avg_order_value
  FROM orders
  WHERE customer_email = calculate_customer_ltv.customer_email
    AND payment_status = 'paid'
    AND created_at >= NOW() - (months_back || ' months')::INTERVAL;

  -- Calculate months active
  SELECT
    GREATEST(1, EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / (30 * 24 * 60 * 60))
  INTO months_active
  FROM orders
  WHERE customer_email = calculate_customer_ltv.customer_email
    AND payment_status = 'paid';

  -- Calculate LTV (simplified: avg_order_value * purchase_frequency * months_active)
  IF months_active > 0 THEN
    ltv := avg_order_value * (order_count::DECIMAL / months_active) * 12; -- Annualized
  END IF;

  RETURN COALESCE(ltv, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get customer segment
CREATE OR REPLACE FUNCTION get_customer_segment(
  customer_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  order_count INTEGER := 0;
  total_spent DECIMAL := 0;
  first_order_date TIMESTAMP;
  last_order_date TIMESTAMP;
  days_since_last_order INTEGER;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(total_amount), 0),
    MIN(created_at),
    MAX(created_at)
  INTO order_count, total_spent, first_order_date, last_order_date
  FROM orders
  WHERE customer_email = get_customer_segment.customer_email
    AND payment_status = 'paid';

  -- Calculate days since last order
  IF last_order_date IS NOT NULL THEN
    days_since_last_order := EXTRACT(DAYS FROM NOW() - last_order_date);
  ELSE
    days_since_last_order := 999;
  END IF;

  -- Segment logic
  IF order_count = 0 THEN
    RETURN 'new';
  ELSIF order_count = 1 THEN
    RETURN 'new_customer';
  ELSIF total_spent > 500 OR order_count > 10 THEN
    RETURN 'vip';
  ELSIF days_since_last_order > 90 THEN
    RETURN 'dormant';
  ELSE
    RETURN 'returning';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get product affinity scores
CREATE OR REPLACE FUNCTION get_product_affinity(
  base_product_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  related_product_id UUID,
  affinity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH product_pairs AS (
    SELECT
      oi1.product_id as base_product,
      oi2.product_id as related_product,
      COUNT(*) as co_occurrence
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    JOIN orders o ON oi1.order_id = o.id
    WHERE oi1.product_id = base_product_id
      AND oi2.product_id != base_product_id
      AND o.payment_status = 'paid'
    GROUP BY oi1.product_id, oi2.product_id
  ),
  base_product_frequency AS (
    SELECT COUNT(DISTINCT oi.order_id) as base_freq
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.product_id = base_product_id
      AND o.payment_status = 'paid'
  )
  SELECT
    pp.related_product,
    (pp.co_occurrence::DECIMAL / bpf.base_freq::DECIMAL) as affinity_score
  FROM product_pairs pp
  CROSS JOIN base_product_frequency bpf
  ORDER BY affinity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;