# Esquema MySQL — AppPizzas

Esta carpeta contiene los scripts que el contenedor `mysql:8` ejecuta
**una sola vez** cuando se crea el volumen de datos (`/docker-entrypoint-initdb.d`).

| Archivo | Acción |
|---|---|
| `01_schema.sql` | Crea base de datos `apppizzas` y todas las tablas. |
| `02_seed_admin.sql` | Placeholder. Ver `03_seed_admin.sh`. |
| `03_seed_admin.sh` | Inserta usuario `admin` con `ADMIN_EMAIL` / `ADMIN_PASSWORD` (bcrypt). |

## Reset del esquema

```bash
docker-compose down -v   # borra el volumen de mysql
docker-compose up -d
```

## Tablas

- `users` — auth propia (email + bcrypt + rol).
- `clients` — formulario público de registro de clientes (sin password).
- `products` — catálogo. `prices` es JSON `[{label, price}]`.
- `banners` — imágenes promocionales.
- `additionals` — adicionales por categoría (`pizza`, `lasagna`, `Com. Rapidas`).
- `orders` — pedidos con `status`, totales, ubicación, descuento.
- `order_items` — items con FK a `orders` (CASCADE).

Las imágenes se guardan en **Cloudinary / S3** (URL pública en columnas `image_url`).
