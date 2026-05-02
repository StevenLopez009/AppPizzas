-- Configuración global de la app (tema, etc.)
USE apppizzas;

CREATE TABLE IF NOT EXISTS app_settings (
  id             TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  theme_primary  VARCHAR(7)       NOT NULL DEFAULT '#F97316',
  updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_app_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB;

INSERT IGNORE INTO app_settings (id, theme_primary) VALUES (1, '#F97316');
