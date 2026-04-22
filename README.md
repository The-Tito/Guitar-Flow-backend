# Guitar Flow Backend

Backend REST para Guitar Flow construido con arquitectura hexagonal y alineado con la infraestructura SQL del proyecto.

## Arquitectura

Estructura por capas:

- `src/domain`: entidades y puertos (interfaces)
- `src/application`: casos de uso
- `src/infrastructure`: adaptadores de entrada/salida (HTTP + PostgreSQL)
- `src/shared`: configuracion y errores comunes

Flujo principal:

1. HTTP recibe request en Express.
2. Controlador invoca un caso de uso.
3. Caso de uso usa puertos del dominio.
4. Adaptador PostgreSQL ejecuta SQL sobre tablas, vistas y funciones existentes.

## Variables de entorno

Este backend usa los nombres definidos en tu `.env`:

- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `APP_CURRENT_USER_ID`

Variables opcionales:

- `DB_HOST` (default: `localhost`)
- `APP_PORT` (default: `3000`)

Hay un archivo `.env.example` solo con nombres de variables.

## Endpoints

- `GET /health`
- `GET /api/keys`
- `GET /api/keys/:keyId/chords`
- `GET /api/progressions`
- `POST /api/progressions`
- `POST /api/progressions/:progressionId/transpose`
- `POST /api/favorites/:progressionId`
- `DELETE /api/favorites/:progressionId`

Header para contexto de usuario:

- `x-user-id` (opcional). Si no se envia, usa `APP_CURRENT_USER_ID`.

## Integracion con RLS

Cada request abre una transaccion y ejecuta:

```sql
SET LOCAL app.current_user_id = '<user-id>';
```

Esto hace que PostgreSQL aplique las politicas RLS de la infraestructura automaticamente.

## Ejecutar

### Opcion A: local

1. Instala Node.js 20+
2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en desarrollo:

```bash
npm run dev
```

### Opcion B: Docker

```bash
docker build -t guitar-flow-back .
docker run --env-file .env -p 3000:3000 guitar-flow-back
```

### Opcion C: Docker Compose (backend + DB)

Se incluye un `docker-compose.yml` en la raiz del backend para levantar ambos servicios:

```bash
docker compose up --build
```

Esto usa `Guitar-Flow-infra` como contexto de build para la base de datos, sin modificar archivos dentro de esa carpeta.
Ademas, el backend espera a que la DB este `healthy` antes de iniciar.

## Nota

La base de datos y objetos SQL (tablas, procedures, funciones, vistas, RLS) se asumen creados por `Guitar-Flow-infra`.
