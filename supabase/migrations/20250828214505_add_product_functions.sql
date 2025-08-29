-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_view_count(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products 
  SET view_count = view_count + 1 
  WHERE id = product_id;
END;
$$;

-- Function to get product with category and reviews
CREATE OR REPLACE FUNCTION get_product_with_details(product_slug TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  preview_images TEXT[],
  download_files TEXT[],
  file_size TEXT,
  file_formats TEXT[],
  tags TEXT[],
  difficulty_level TEXT,
  software_required TEXT[],
  dimensions TEXT,
  is_active BOOLEAN,
  is_featured BOOLEAN,
  view_count INTEGER,
  download_count INTEGER,
  created_at TIMESTAMPTZ,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  avg_rating DECIMAL(3,2),
  review_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.short_description,
    p.price,
    p.compare_at_price,
    p.preview_images,
    p.download_files,
    p.file_size,
    p.file_formats,
    p.tags,
    p.difficulty_level,
    p.software_required,
    p.dimensions,
    p.is_active,
    p.is_featured,
    p.view_count,
    p.download_count,
    p.created_at,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    COALESCE(ROUND(AVG(r.rating), 2), 0.00) as avg_rating,
    COUNT(r.id) as review_count
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_reviews r ON p.id = r.product_id AND r.is_approved = true
  WHERE p.slug = product_slug AND p.is_active = true
  GROUP BY p.id, c.name, c.slug;
END;
$$;

-- Function to search products with full-text search
CREATE OR REPLACE FUNCTION search_products_fts(
  search_term TEXT,
  category_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 12,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  preview_images TEXT[],
  tags TEXT[],
  difficulty_level TEXT,
  is_featured BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.short_description,
    p.price,
    p.compare_at_price,
    p.preview_images,
    p.tags,
    p.difficulty_level,
    p.is_featured,
    p.view_count,
    p.created_at,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')),
      plainto_tsquery('english', search_term)
    ) as rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')) 
      @@ plainto_tsquery('english', search_term)
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Function to get popular products
CREATE OR REPLACE FUNCTION get_popular_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  preview_images TEXT[],
  tags TEXT[],
  difficulty_level TEXT,
  is_featured BOOLEAN,
  view_count INTEGER,
  download_count INTEGER,
  created_at TIMESTAMPTZ,
  category_id UUID,
  category_name TEXT,
  popularity_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.short_description,
    p.price,
    p.compare_at_price,
    p.preview_images,
    p.tags,
    p.difficulty_level,
    p.is_featured,
    p.view_count,
    p.download_count,
    p.created_at,
    p.category_id,
    c.name as category_name,
    -- Calculate popularity score based on views, downloads, and recency
    (
      (p.view_count * 0.3) + 
      (p.download_count * 0.5) + 
      (EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 * -0.1) +
      (CASE WHEN p.is_featured THEN 10 ELSE 0 END)
    ) as popularity_score
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
  ORDER BY popularity_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get user's download history
CREATE OR REPLACE FUNCTION get_user_downloads(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  product_name TEXT,
  product_slug TEXT,
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  download_count INTEGER,
  max_downloads INTEGER,
  created_at TIMESTAMPTZ,
  order_number TEXT,
  is_expired BOOLEAN,
  is_download_limit_reached BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.id,
    oi.product_name,
    oi.product_slug,
    oi.download_url,
    oi.download_expires_at,
    oi.download_count,
    oi.max_downloads,
    oi.created_at,
    o.order_number,
    (oi.download_expires_at < NOW()) as is_expired,
    (oi.download_count >= oi.max_downloads) as is_download_limit_reached
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.user_id = user_uuid 
    AND o.status = 'completed'
    AND oi.download_url IS NOT NULL
  ORDER BY oi.created_at DESC;
END;
$$;

-- Function to update download count and log
CREATE OR REPLACE FUNCTION log_download(
  order_item_uuid UUID, 
  user_uuid UUID, 
  user_ip INET DEFAULT NULL,
  user_agent_string TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_downloads INTEGER;
  max_downloads INTEGER;
  download_expired BOOLEAN;
BEGIN
  -- Check if download is still valid
  SELECT oi.download_count, oi.max_downloads, (oi.download_expires_at < NOW())
  INTO current_downloads, max_downloads, download_expired
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE oi.id = order_item_uuid 
    AND o.user_id = user_uuid 
    AND o.status = 'completed';

  -- Return false if download not found or expired
  IF NOT FOUND OR download_expired OR current_downloads >= max_downloads THEN
    RETURN FALSE;
  END IF;

  -- Increment download count
  UPDATE order_items 
  SET download_count = download_count + 1 
  WHERE id = order_item_uuid;

  -- Log the download
  INSERT INTO download_logs (order_item_id, user_id, ip_address, user_agent)
  VALUES (order_item_uuid, user_uuid, user_ip, user_agent_string);

  RETURN TRUE;
END;
$$;

-- Create indexes for popular products function
CREATE INDEX IF NOT EXISTS idx_products_popularity 
ON products (is_active, view_count DESC, download_count DESC, created_at DESC);

-- Note: Full-text search indexes are created automatically by Postgres for GIN indexes
-- We'll handle search through the search_products_fts function instead

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_with_details(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_products_fts(TEXT, UUID, INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_popular_products(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_downloads(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_download(UUID, UUID, INET, TEXT) TO authenticated;