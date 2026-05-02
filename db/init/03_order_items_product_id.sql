-- Amplía product_id para ítems sin fila en `products` (ej. pizza por mitades con id compuesto).
-- En bases ya inicializadas seguirán siendo CHAR(36) hasta ejecutar este ALTER.
USE apppizzas;

ALTER TABLE order_items MODIFY COLUMN product_id VARCHAR(512) NULL;
