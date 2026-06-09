-- Migración: Cambiar table_number de INT a VARCHAR para almacenar nombres de mesas
ALTER TABLE orders MODIFY COLUMN table_number VARCHAR(100) NULL DEFAULT NULL;
