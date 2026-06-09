-- Migración: Arreglar constrainte de order_number
-- Remover la constrainte única compuesta (order_number, company_id)
-- y crear una constrainte única solo en order_number

ALTER TABLE orders DROP KEY uk_order_number_company;
ALTER TABLE orders ADD UNIQUE KEY uk_order_number (order_number);

-- Opcionalmente, remover la columna company_id si no se usa
-- ALTER TABLE orders DROP COLUMN company_id;
-- ALTER TABLE orders DROP KEY idx_orders_company;
