-- Migración: crear tabla restaurant_zones para el mapa de mesas
CREATE TABLE IF NOT EXISTS restaurant_zones (
  id           VARCHAR(50)  NOT NULL PRIMARY KEY,
  label        VARCHAR(100) NOT NULL,
  type         VARCHAR(20)  NOT NULL,
  col_pos      INT          NOT NULL DEFAULT 0,
  row_pos      INT          NOT NULL DEFAULT 0,
  col_span     INT          NOT NULL DEFAULT 1,
  row_span     INT          NOT NULL DEFAULT 1,
  occupied     TINYINT      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_occupied (occupied)
) ENGINE=InnoDB;

-- Insertar mesas por defecto (Piso 1)
INSERT IGNORE INTO restaurant_zones (id, label, type, col_pos, row_pos, col_span, row_span, occupied) VALUES
('VIP 1', 'VIP 1', 'vip', 1, 0, 2, 1, 0),
('VIP 2', 'VIP 2', 'vip', 5, 0, 2, 1, 0),
('Mesa 4', 'Mesa 4', 'mesa', 1, 2, 2, 1, 0),
('Mesa 3', 'Mesa 3', 'mesa', 1, 3, 2, 1, 0),
('Mesa 2', 'Mesa 2', 'mesa', 1, 4, 2, 1, 0),
('Mesa 1', 'Mesa 1', 'mesa', 1, 5, 2, 1, 0),
('Mesa 5', 'Mesa 5', 'mesa', 5, 2, 2, 1, 0),
('Mesa 6', 'Mesa 6', 'mesa', 5, 3, 2, 1, 0),
('Mesa 7', 'Mesa 7', 'mesa', 5, 4, 2, 1, 0),
('Barra 1', 'Barra 1', 'barra', 0, 4, 1, 2, 0),
('Barra 2', 'Barra 2', 'barra', 0, 2, 1, 2, 0),
('Terraza', 'Terraza', 'zona', 5, 6, 4, 2, 0);
