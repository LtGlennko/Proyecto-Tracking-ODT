# Base de Datos — Tracking OTD

## Opción A: Docker (recomendado)

La BD ya está inicializada si usaste Docker. Verificar:

```bash
cd tracking-otd-api
docker compose up postgres pgadmin -d
docker compose logs postgres | grep "inicializada"
```

## Opción B: PostgreSQL local

```bash
# Crear base de datos
createdb -U postgres appwebdb01

# Ejecutar script completo (tablas + mejoras + seeds)
psql -U postgres -d appwebdb01 -f database/init.sql

# Verificar tablas
psql -U postgres -d appwebdb01 -c "\dt"

# Verificar seeds
psql -U postgres -d appwebdb01 -c "SELECT nombre FROM empresa; SELECT nombre FROM hito;"
```

## Contenido de init.sql

- **21 tablas** del modelo de datos
- **Constraints de negocio**: chk_chat_xor, chk_sla_min_dimension
- **Unique constraints**: email/oid de usuario, código de empresa, etc.
- **17 índices** de performance
- **Seed data**: 3 empresas, 2 grupos paralelos, 9 hitos, 20 subetapas

## Reinicializar desde cero (Docker)

```bash
docker compose down -v          # borra volumen
docker compose up postgres -d   # recrea con init.sql
```
