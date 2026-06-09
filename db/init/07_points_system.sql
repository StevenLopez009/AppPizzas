-- AppPizzas — Sistema de puntos para usuarios registrados
-- Ejecutado automáticamente por el contenedor mysql al crear el volumen

-- 1. Agregar columna points a users (saldo de puntos)
ALTER TABLE users ADD COLUMN points INT NOT NULL DEFAULT 0;

-- 2. Agregar user_id a orders (vincular pedidos a usuarios)
ALTER TABLE orders ADD COLUMN user_id CHAR(36) NULL DEFAULT NULL AFTER id;
ALTER TABLE orders ADD INDEX idx_orders_user_id (user_id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Tabla de historial de puntos (auditoría)
CREATE TABLE IF NOT EXISTS user_points_history (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  amount     INT          NOT NULL,
  reason     VARCHAR(100) NOT NULL,
  order_id   CHAR(36)     NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_points_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_points_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_points_history_user (user_id),
  INDEX idx_points_history_created_at (created_at)
) ENGINE=InnoDB;
