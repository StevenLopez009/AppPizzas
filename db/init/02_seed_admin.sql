-- Crea (o re-eleva) el usuario admin inicial.
--
-- El password está bcrypt-hasheado con bcryptjs (cost 10) y corresponde
-- a "admin1234". Se mantiene como hash literal para que la inicialización
-- del contenedor mysql:8 no requiera python ni utilidades extra.
--
-- ⚠ Cámbialo en producción. Para generar otro:
--   node -e "console.log(require('bcryptjs').hashSync('TU_PASS',10))"

USE apppizzas;

INSERT INTO users (id, email, password_hash, name, role)
VALUES (
  UUID(),
  'lacarretapizzas@gmail.com',
  '$2b$10$minp119Ge01BgzC.NmDoWeiqQauZeh950im5oOopecdbSdw7RZVKO',
  'Admin',
  'admin'
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = 'admin',
  name          = COALESCE(name, VALUES(name));
