# Docker — Tracking OTD

## Prerequisitos
- Docker Desktop instalado y corriendo
- Docker Compose v2+

Verificar instalación:
```bash
docker --version        # Docker version 24+
docker compose version  # Docker Compose version v2+
```

---

## Inicio rápido (solo PostgreSQL)

Este es el **paso 0** para desarrollar: levanta la BD lista para recibir
las migraciones y el backend NestJS desde tu máquina local.

### 1. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores (los defaults ya funcionan para dev local)
```

### 2. Levantar PostgreSQL + pgAdmin
```bash
docker compose up postgres pgadmin -d
```

### 3. Verificar que la BD está lista
```bash
docker compose ps
# Debes ver: tracking-otd-postgres → healthy
# Debes ver: tracking-otd-pgadmin  → running

# Ver logs de la inicialización
docker compose logs postgres
# Busca: ✅ Base de datos tracking_otd inicializada correctamente
```

### 4. Conectar desde pgAdmin
- URL: http://localhost:5050
- Email: admin@kaufmann.com
- Password: admin123

Agregar servidor en pgAdmin:
- Host: `postgres`  (nombre del servicio dentro de Docker)
- Port: `5432`
- Database: `tracking_otd`
- Username: `tracking_user`
- Password: `tracking_pass_2024`

### 5. Conectar desde tu IDE (DBeaver, TablePlus, etc.)
- Host: `localhost`
- Port: `5432`
- Database: `tracking_otd`
- Username: `tracking_user`
- Password: `tracking_pass_2024`

---

## Levantar todo el stack (BD + API)

```bash
# Con hot-reload (desarrollo)
docker compose up -d

# En producción (api compilada)
docker compose --profile full up -d
```

---

## Comandos útiles

```bash
# Ver estado de todos los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f postgres
docker compose logs -f api

# Acceder al shell de PostgreSQL
docker compose exec postgres psql -U tracking_user -d tracking_otd

# Verificar tablas creadas
docker compose exec postgres psql -U tracking_user -d tracking_otd -c "\dt"

# Verificar seeds
docker compose exec postgres psql -U tracking_user -d tracking_otd \
  -c "SELECT nombre FROM empresa; SELECT nombre FROM hito;"

# Reiniciar solo postgres (sin borrar datos)
docker compose restart postgres

# Detener todo (conserva datos)
docker compose down

# ⚠️  DESTRUYE la BD completa y todos sus datos
docker compose down -v
```

---

## Reinicializar la base de datos desde cero

```bash
# Detiene contenedores y BORRA el volumen de datos
docker compose down -v

# Vuelve a levantar — ejecuta 01-init.sql automáticamente
docker compose up postgres pgadmin -d

# Verificar
docker compose logs postgres | grep "inicializada"
```

---

## Troubleshooting

### "port 5432 already in use"
Tienes PostgreSQL local corriendo. Cambia el puerto en `.env`:
```env
DB_PORT=5433
```
Y actualiza `DB_HOST=localhost` con `DB_PORT=5433` en tu `.env` del backend.

### "password authentication failed"
Borra el volumen (tiene la contraseña vieja cacheada):
```bash
docker compose down -v
docker compose up postgres -d
```

### pgAdmin no carga el servidor
El servidor en pgAdmin usa `postgres` (nombre del servicio Docker), no `localhost`.
Desde tu máquina es `localhost`, desde dentro de Docker es `postgres`.

### Ver qué hay en la BD desde terminal
```bash
docker compose exec postgres psql -U tracking_user -d tracking_otd -c "
  SELECT 'empresa' as tabla, COUNT(*) FROM empresa
  UNION ALL SELECT 'hito', COUNT(*) FROM hito
  UNION ALL SELECT 'subetapa', COUNT(*) FROM subetapa;
"
```
