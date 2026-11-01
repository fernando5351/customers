# Takumi

Backend NestJS reconstruido como workspace orientado a microservicios.

## Principios iniciales

- El API Gateway es la entrada HTTP.
- Los servicios internos se agregarán como aplicaciones Nest separadas.
- La base de datos se cambia únicamente con migraciones.
- TypeORM `synchronize` debe permanecer siempre en `false`.
- `libs/database` comparte infraestructura estable: conexión y entidades base de auditoría.
- Cada microservicio es dueño de sus entidades de dominio y sus migraciones.

## Estructura inicial

```text
apps/
  api-gateway/
  customers-service/

libs/
  common/
  config/
  database/
```

## Arranque local

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run start:dev:gateway
```

Customers service:

```bash
npm run start:dev:customers
```

Smoke test vía gateway:

```bash
GET /api/customers/health
```

## Migraciones

Crear una migración vacía:

```bash
npm run migration:create -- libs/database/src/migrations/NombreDeLaMigracion
```

Generar una migración desde entidades:

```bash
npm run migration:generate -- libs/database/src/migrations/NombreDeLaMigracion
```

Ejecutar migraciones:

```bash
npm run migration:run
```

Ver estado:

```bash
npm run migration:show
```
