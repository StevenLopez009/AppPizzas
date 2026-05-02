USE apppizzas;

CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_sort (sort_order)
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (id, name, sort_order) VALUES
  (UUID(), 'Pizza Sal',         1),
  (UUID(), 'Pizza Dulce',       2),
  (UUID(), 'Panzerotti',        3),
  (UUID(), 'Lasaña Spaguetti',  4),
  (UUID(), 'Com. Rapidas',      5),
  (UUID(), 'Platos Fuertes',    6),
  (UUID(), 'Bebidas',           7);
