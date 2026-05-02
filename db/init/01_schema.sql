-- AppPizzas — Schema MySQL 8
-- Reemplazo de Supabase. Ejecutado automáticamente por el contenedor mysql:8 al
-- crear el volumen vacío (mount /docker-entrypoint-initdb.d).

CREATE DATABASE IF NOT EXISTS apppizzas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE apppizzas;

-- ---------- Usuarios (auth) ----------
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  name          VARCHAR(120)  NULL,
  phone         VARCHAR(32)   NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Clientes (formulario público de registro) ----------
CREATE TABLE IF NOT EXISTS clients (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(32)  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clients_email (email)
) ENGINE=InnoDB;

-- ---------- Categorías ----------
CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_sort (sort_order)
) ENGINE=InnoDB;

-- ---------- Productos ----------
CREATE TABLE IF NOT EXISTS products (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  description TEXT          NULL,
  prices      JSON          NOT NULL,
  image_url   VARCHAR(1024) NULL,
  category    VARCHAR(100)  NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- ---------- Banners ----------
CREATE TABLE IF NOT EXISTS banners (
  id         CHAR(36)      NOT NULL PRIMARY KEY,
  image_url  VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Adicionales ----------
CREATE TABLE IF NOT EXISTS additionals (
  id         CHAR(36)      NOT NULL PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  category   VARCHAR(100)  NULL,
  active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_additionals_category (category)
) ENGINE=InnoDB;

-- ---------- Pedidos ----------
CREATE TABLE IF NOT EXISTS orders (
  id                  CHAR(36)      NOT NULL PRIMARY KEY,
  order_number        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_type          ENUM('domicilio','mesa','recoger') NOT NULL,
  status              VARCHAR(40)   NOT NULL DEFAULT 'recibido',
  customer_name       VARCHAR(255)  NULL,
  customer_phone      VARCHAR(32)   NULL,
  customer_address    VARCHAR(500)  NULL,
  table_number        INT           NULL,
  payment_method      VARCHAR(40)   NULL,
  cash_amount         DECIMAL(12,2) NULL,
  subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
  neighborhood        VARCHAR(100)  NULL,
  delivery_fee        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total               DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2)  NOT NULL DEFAULT 0,
  lat                 DECIMAL(10,7) NULL,
  lng                 DECIMAL(10,7) NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_number (order_number),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at),
  INDEX idx_orders_order_type (order_type)
) ENGINE=InnoDB;

-- ---------- Items del pedido ----------
CREATE TABLE IF NOT EXISTS order_items (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  order_id      CHAR(36)      NOT NULL,
  -- IDs UUID de catálogo O claves sintéticas largas (ej. pizza por mitades en el cliente)
  product_id    VARCHAR(512)  NULL,
  product_name  VARCHAR(255)  NOT NULL,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity      INT           NOT NULL DEFAULT 1,
  size          VARCHAR(40)   NULL,
  extra         TEXT          NULL,
  observations  TEXT          NULL,
  additionals   JSON          NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;
