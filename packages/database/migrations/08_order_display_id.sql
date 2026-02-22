-- 1. Create a function to generate a random 8-character string
CREATE OR REPLACE FUNCTION generate_order_display_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'ORD-' || result; -- Outputs something like: ORD-X7B92A1C
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Add the column to your orders table
ALTER TABLE orders 
ADD COLUMN display_id TEXT UNIQUE DEFAULT generate_order_display_id();

-- 3. (Optional) Index it for fast lookups
CREATE INDEX idx_orders_display_id ON orders(display_id);
