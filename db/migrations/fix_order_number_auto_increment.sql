-- Migración: Agregar AUTO_INCREMENT a order_number
-- Primero remover la restricción única para poder modificar la columna
ALTER TABLE orders DROP KEY uk_order_number;

-- Modificar la columna para agregar AUTO_INCREMENT
ALTER TABLE orders MODIFY COLUMN order_number INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE;

-- Resetear el AUTO_INCREMENT a un valor mayor que el máximo actual
ALTER TABLE orders AUTO_INCREMENT = 1;
