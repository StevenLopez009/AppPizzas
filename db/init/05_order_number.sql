USE apppizzas;

-- Step 1: add column without AUTO_INCREMENT so we can backfill
ALTER TABLE orders
  ADD COLUMN order_number INT UNSIGNED NOT NULL DEFAULT 0 AFTER id;

-- Step 2: backfill existing rows in chronological order
SET @n = 0;
UPDATE orders SET order_number = (@n := @n + 1) ORDER BY created_at ASC;

-- Step 3: enable AUTO_INCREMENT and add unique index
ALTER TABLE orders
  MODIFY COLUMN order_number INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD UNIQUE KEY uk_order_number (order_number);
