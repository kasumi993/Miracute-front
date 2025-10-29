-- Auto-manage bundle status based on product availability
-- When any product in a bundle becomes inactive, the bundle should be inactive
-- When all products in a bundle are active, the bundle can be active again

-- Function to check and update bundle status
CREATE OR REPLACE FUNCTION check_bundle_status()
RETURNS TRIGGER AS $$
DECLARE
    bundle_record RECORD;
    active_product_count INTEGER;
    total_product_count INTEGER;
BEGIN
    -- Handle different trigger scenarios
    IF TG_TABLE_NAME = 'products' THEN
        -- Product was updated, check all bundles containing this product
        FOR bundle_record IN
            SELECT id, products, is_active
            FROM product_bundles
            WHERE products @> ARRAY[COALESCE(NEW.id, OLD.id)]::uuid[]
        LOOP
            -- Count active products in this bundle
            SELECT COUNT(*) INTO active_product_count
            FROM products
            WHERE id = ANY(bundle_record.products)
            AND is_active = true;

            -- Count total products in bundle
            SELECT array_length(bundle_record.products, 1) INTO total_product_count;

            -- Update bundle status based on product availability
            IF active_product_count < total_product_count THEN
                -- Some products are inactive, deactivate bundle
                UPDATE product_bundles
                SET is_active = false,
                    updated_at = now()
                WHERE id = bundle_record.id
                AND is_active = true; -- Only update if currently active
            ELSIF active_product_count = total_product_count AND active_product_count > 0 THEN
                -- All products are active, bundle can be active
                -- Note: We don't automatically activate bundles, just allow them to be activated
                -- This prevents unwanted auto-activation of intentionally disabled bundles
                NULL; -- No automatic activation
            END IF;
        END LOOP;

    ELSIF TG_TABLE_NAME = 'product_bundles' THEN
        -- Bundle was updated, check if products support the new status
        IF NEW.is_active = true AND OLD.is_active = false THEN
            -- Bundle is being activated, ensure all products are active
            SELECT COUNT(*) INTO active_product_count
            FROM products
            WHERE id = ANY(NEW.products)
            AND is_active = true;

            SELECT array_length(NEW.products, 1) INTO total_product_count;

            IF active_product_count < total_product_count THEN
                -- Prevent activation if any products are inactive
                RAISE EXCEPTION 'Cannot activate bundle: some products are inactive. Inactive products: %',
                    (SELECT string_agg(name, ', ')
                     FROM products
                     WHERE id = ANY(NEW.products)
                     AND is_active = false);
            END IF;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on product updates
DROP TRIGGER IF EXISTS product_status_bundle_check ON products;
CREATE TRIGGER product_status_bundle_check
    AFTER UPDATE OF is_active ON products
    FOR EACH ROW
    WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
    EXECUTE FUNCTION check_bundle_status();

-- Trigger on product deletion
DROP TRIGGER IF EXISTS product_delete_bundle_check ON products;
CREATE TRIGGER product_delete_bundle_check
    AFTER DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_bundle_status();

-- Trigger on bundle activation attempts
DROP TRIGGER IF EXISTS bundle_activation_check ON product_bundles;
CREATE TRIGGER bundle_activation_check
    BEFORE UPDATE OF is_active ON product_bundles
    FOR EACH ROW
    WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
    EXECUTE FUNCTION check_bundle_status();

-- Add helpful view for bundle health monitoring
CREATE OR REPLACE VIEW bundle_health AS
SELECT
    pb.id,
    pb.name,
    pb.is_active as bundle_active,
    array_length(pb.products, 1) as total_products,
    COUNT(p.id) FILTER (WHERE p.is_active = true) as active_products,
    COUNT(p.id) FILTER (WHERE p.is_active = false) as inactive_products,
    CASE
        WHEN COUNT(p.id) FILTER (WHERE p.is_active = false) > 0 THEN 'has_inactive_products'
        WHEN pb.is_active = false THEN 'manually_disabled'
        ELSE 'healthy'
    END as status,
    array_agg(p.name) FILTER (WHERE p.is_active = false) as inactive_product_names
FROM product_bundles pb
LEFT JOIN products p ON p.id = ANY(pb.products)
GROUP BY pb.id, pb.name, pb.is_active, pb.products;

-- Grant permissions
GRANT SELECT ON bundle_health TO anon, authenticated;