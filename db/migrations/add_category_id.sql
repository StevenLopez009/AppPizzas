-- Migración: agregar category_id a products y additionals
-- Ejecutar solo si las columnas no existen (MySQL 8.0 no soporta ADD COLUMN IF NOT EXISTS)
-- Verificar primero: SHOW COLUMNS FROM products LIKE 'category_id';
ALTER TABLE products ADD COLUMN category_id CHAR(36) NULL AFTER category;
ALTER TABLE additionals ADD COLUMN category_id CHAR(36) NULL AFTER category;
