# Guitar Flow — Documentación de API Backend

## Tabla de contenidos
1. [Visión general](#visión-general)
2. [Configuración e inicio](#configuración-e-inicio)
3. [Autenticación con JWT](#autenticación-con-jwt)
4. [Manejo de errores](#manejo-de-errores)
5. [Endpoints](#endpoints)
   - [Health](#1-health)
   - [Autenticación](#2-autenticación)
     - [Registro](#2a-registro)
     - [Login](#2b-login)
   - [Tonalidades (Keys)](#3-tonalidades-keys)
   - [Acordes por tonalidad (Chords)](#4-acordes-por-tonalidad-chords)
   - [Progresiones (Progressions)](#5-progresiones-progressions)
   - [Transponer una progresión](#6-transponer-una-progresión)
   - [Favoritos (Favorites)](#7-favoritos-favorites)

---

## Visión general

Guitar Flow Back es una API REST construida con **Node.js + Express + TypeScript** siguiendo arquitectura hexagonal. Gestiona tonalidades musicales, progresiones de acordes y favoritos de usuarios.

| Propiedad     | Valor                          |
|---------------|--------------------------------|
| Framework     | Express 4                      |
| Lenguaje      | TypeScript 5.6                 |
| Base de datos | PostgreSQL (driver `pg`)       |
| Validación    | Zod 3                          |
| Autenticación | JWT (jsonwebtoken + bcrypt)    |
| Puerto por defecto | `3000`                    |
| Base URL      | `http://localhost:3000`        |

---

## Configuración e inicio

Variables de entorno requeridas en el archivo `.env`:

```env
# Base de datos
APP_DB_USER=app_guitarist
APP_DB_PASSWORD=secret
DB_NAME=guitarflow
DB_PORT=5432
DB_HOST=localhost            # opcional, default: localhost

# Servidor
APP_PORT=3000                # opcional, default: 3000

# JWT — generar con: openssl rand -base64 48
JWT_SECRET=cambia_esto_por_un_secreto_seguro_de_al_menos_32_chars
JWT_EXPIRES_IN=7d            # opcional, default: 7d
```

```bash
npm run dev    # modo desarrollo con hot-reload
npm run build  # compila a dist/
npm start      # ejecuta dist/index.js
```

---

## Autenticación con JWT

La API usa **JSON Web Tokens (JWT)** con firma `HS256`. Para acceder a cualquier endpoint bajo `/api/*` (excepto `/health` y `/api/auth/*`) se requiere un token válido.

### Flujo

```
1. POST /api/auth/register  →  recibe { token }
   POST /api/auth/login     →  recibe { token }

2. Incluir el token en todas las peticiones protegidas:
   Authorization: Bearer <token>

3. El middleware verifica la firma y extrae el userId del payload.
   Las consultas usan SET LOCAL app.current_user_id para que las
   políticas RLS de PostgreSQL filtren los datos automáticamente.
```

### Header requerido en rutas protegidas

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Payload del token

```json
{
  "userId": 3,
  "iat": 1713744000,
  "exp": 1714348800
}
```

### Errores de autenticación

| Código | Mensaje                              | Causa                                     |
|--------|--------------------------------------|-------------------------------------------|
| `401`  | Token de autenticación requerido     | Header `Authorization` ausente o sin `Bearer` |
| `401`  | Token inválido o expirado            | Firma incorrecta o token caducado         |
| `409`  | El email ya está registrado          | Intento de registro con email duplicado   |
| `401`  | Credenciales inválidas               | Email inexistente o contraseña incorrecta |

---

## Manejo de errores

Todas las respuestas de error siguen uno de estos formatos:

### Error de validación (400)
Zod no pudo parsear el body o un parámetro de ruta.

```json
{
  "message": "Validation error",
  "issues": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["workTitle"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### Error de aplicación (4xx)
Lanzado explícitamente por los casos de uso con `AppError`.

```json
{
  "message": "Descripción del error"
}
```

### Error interno (500)

```json
{
  "message": "Internal server error"
}
```

---

## Endpoints

### 1. Health

Verifica que el servidor esté activo.

```
GET /health
```

**Autenticación:** no requerida.

**Body:** ninguno.

**Respuesta exitosa — 200 OK**

```json
{
  "status": "ok"
}
```

---

### 2. Autenticación

#### 2a. Registro

Crea una cuenta nueva y devuelve un JWT listo para usar.

```
POST /api/auth/register
```

**Autenticación:** no requerida.

**Headers:**

| Header         | Valor              | Requerido |
|----------------|--------------------|-----------|
| `Content-Type` | `application/json` | Sí        |

**Body (JSON):**

```json
{
  "full_name": "Ana García",
  "email": "ana@example.com",
  "password": "miPassword123"
}
```

| Campo       | Tipo     | Reglas de validación                        |
|-------------|----------|---------------------------------------------|
| `full_name` | `string` | Requerido. Mínimo 1 carácter.               |
| `email`     | `string` | Requerido. Formato email válido.            |
| `password`  | `string` | Requerido. Mínimo 8 caracteres.             |

**Respuesta exitosa — 201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**

| Código | Causa                                       |
|--------|---------------------------------------------|
| `400`  | Validación fallida (email inválido, etc.)   |
| `409`  | El email ya está registrado                 |

---

#### 2b. Login

Autentica un usuario existente y devuelve un JWT.

```
POST /api/auth/login
```

**Autenticación:** no requerida.

**Headers:**

| Header         | Valor              | Requerido |
|----------------|--------------------|-----------|
| `Content-Type` | `application/json` | Sí        |

**Body (JSON):**

```json
{
  "email": "ana@example.com",
  "password": "miPassword123"
}
```

| Campo      | Tipo     | Reglas de validación             |
|------------|----------|----------------------------------|
| `email`    | `string` | Requerido. Formato email válido. |
| `password` | `string` | Requerido.                       |

**Respuesta exitosa — 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**

| Código | Causa                                             |
|--------|---------------------------------------------------|
| `400`  | Validación fallida (email inválido, etc.)         |
| `401`  | Email no registrado o contraseña incorrecta       |

---

### 3. Tonalidades (Keys)

Lista todas las tonalidades musicales disponibles en el catálogo.

```
GET /api/keys
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Body:** ninguno.

**Respuesta exitosa — 200 OK**

```json
[
  {
    "id": 1,
    "keyName": "Do Mayor",
    "scaleType": "Mayor",
    "semitoneValue": 0
  },
  {
    "id": 2,
    "keyName": "La Menor",
    "scaleType": "Menor",
    "semitoneValue": 9
  }
]
```

| Campo          | Tipo              | Descripción                                   |
|----------------|-------------------|-----------------------------------------------|
| `id`           | `number`          | Identificador único de la tonalidad           |
| `keyName`      | `string`          | Nombre de la tonalidad (ej. "Do Mayor")       |
| `scaleType`    | `"Mayor"│"Menor"` | Tipo de escala                                |
| `semitoneValue`| `number`          | Valor en semitonos (0–11)                     |

---

### 4. Acordes por tonalidad (Chords)

Lista los acordes pertenecientes a una tonalidad específica.

```
GET /api/keys/:keyId/chords
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Parámetros de ruta:**

| Parámetro | Tipo   | Descripción                          |
|-----------|--------|--------------------------------------|
| `keyId`   | number | ID de la tonalidad (entero positivo) |

**Body:** ninguno.

**Respuesta exitosa — 200 OK**

```json
[
  {
    "chordId": 1,
    "chordName": "C",
    "chordType": "maj",
    "semitoneValue": 0,
    "musicalDegree": "I",
    "fretboardUrl": "https://example.com/chords/C.png"
  },
  {
    "chordId": 5,
    "chordName": "Am",
    "chordType": "min",
    "semitoneValue": 9,
    "musicalDegree": "VI",
    "fretboardUrl": null
  }
]
```

| Campo           | Tipo            | Descripción                                      |
|-----------------|-----------------|--------------------------------------------------|
| `chordId`       | `number`        | Identificador único del acorde                   |
| `chordName`     | `string`        | Nombre del acorde (ej. "Am")                     |
| `chordType`     | `string`        | Tipo (ej. "maj", "min", "dim")                   |
| `semitoneValue` | `number`        | Posición en semitonos (0–11)                     |
| `musicalDegree` | `string`        | Grado dentro de la escala (ej. "I", "IV", "V")  |
| `fretboardUrl`  | `string │ null` | URL de imagen del diagrama de traste             |

**Error — 400** si `keyId` no es un entero positivo válido.

---

### 5. Progresiones (Progressions)

#### 5a. Listar progresiones

Devuelve todas las progresiones visibles para el usuario activo (propias y compartidas, según políticas de la base de datos).

```
GET /api/progressions
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Body:** ninguno.

**Respuesta exitosa — 200 OK**

```json
[
  {
    "progressionId": 1,
    "workTitle": "Intro de Yesterday",
    "author": "John",
    "keyName": "Fa Mayor",
    "scaleType": "Mayor",
    "chords": [
      {
        "orderPosition": 1,
        "chordName": "F",
        "fretboardUrl": "https://example.com/chords/F.png"
      },
      {
        "orderPosition": 2,
        "chordName": "Am",
        "fretboardUrl": null
      }
    ]
  }
]
```

| Campo           | Tipo            | Descripción                                      |
|-----------------|-----------------|--------------------------------------------------|
| `progressionId` | `number`        | Identificador único de la progresión             |
| `workTitle`     | `string`        | Título de la obra                                |
| `author`        | `string`        | Nombre del autor/usuario propietario             |
| `keyName`       | `string`        | Nombre de la tonalidad base                      |
| `scaleType`     | `string`        | Tipo de escala ("Mayor" o "Menor")               |
| `chords`        | `array`         | Lista de acordes ordenados                       |
| `chords[].orderPosition` | `number` | Posición en la progresión (1-indexed)       |
| `chords[].chordName`     | `string` | Nombre del acorde                           |
| `chords[].fretboardUrl`  | `string│null` | URL de imagen del diagrama de traste   |

---

#### 5b. Crear progresión

Crea una nueva progresión de acordes para el usuario activo.

```
POST /api/progressions
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Headers:**

| Header         | Valor              | Requerido |
|----------------|--------------------|-----------|
| `Content-Type` | `application/json` | Sí        |

**Body (JSON):**

```json
{
  "workTitle": "Mi progresión",
  "baseKeyId": 1,
  "chordIds": [1, 5, 8, 3]
}
```

| Campo       | Tipo       | Reglas de validación                              |
|-------------|------------|---------------------------------------------------|
| `workTitle` | `string`   | Requerido. Mínimo 1 carácter.                     |
| `baseKeyId` | `number`   | Requerido. Entero positivo. Debe existir en Keys. |
| `chordIds`  | `number[]` | Requerido. Al menos 1 elemento. Cada ID debe ser un entero positivo. El orden del array define el orden de la progresión. |

**Respuesta exitosa — 201 Created**

```json
{
  "message": "Progression created"
}
```

**Error — 400** si falla la validación del body.

---

### 6. Transponer una progresión

Genera una nueva progresión desplazando todos los acordes de la original un número de semitonos dado. La progresión original **no se modifica**.

```
POST /api/progressions/:progressionId/transpose
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Parámetros de ruta:**

| Parámetro       | Tipo   | Descripción                                        |
|-----------------|--------|----------------------------------------------------|
| `progressionId` | number | ID de la progresión a transponer (entero positivo) |

**Headers:**

| Header         | Valor              | Requerido |
|----------------|--------------------|-----------|
| `Content-Type` | `application/json` | Sí        |

**Body (JSON):**

```json
{
  "semitonesShift": 2,
  "newTitle": "Mi progresión en Re Mayor"
}
```

| Campo           | Tipo     | Reglas de validación                            |
|-----------------|----------|-------------------------------------------------|
| `semitonesShift`| `number` | Requerido. Entero entre -11 y 11. Positivo sube, negativo baja. |
| `newTitle`      | `string` | Requerido. Mínimo 1 carácter.                   |

**Respuesta exitosa — 201 Created**

```json
{
  "newProgressionId": 7
}
```

| Campo              | Tipo     | Descripción                                    |
|--------------------|----------|------------------------------------------------|
| `newProgressionId` | `number` | ID de la nueva progresión transpuesta creada   |

**Error — 400** si `progressionId` no es válido o falla la validación del body.

---

### 7. Favoritos (Favorites)

#### 7a. Agregar a favoritos

Marca una progresión como favorita del usuario activo. Si ya existe el favorito, la operación no falla (idempotente).

```
POST /api/favorites/:progressionId
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Parámetros de ruta:**

| Parámetro       | Tipo   | Descripción                                    |
|-----------------|--------|------------------------------------------------|
| `progressionId` | number | ID de la progresión a marcar como favorita     |

**Body:** ninguno.

**Respuesta exitosa — 201 Created**

```json
{
  "message": "Favorite added"
}
```

---

#### 7b. Eliminar de favoritos

Elimina una progresión de los favoritos del usuario activo.

```
DELETE /api/favorites/:progressionId
```

**Autenticación:** requerida (`Authorization: Bearer <token>`).

**Parámetros de ruta:**

| Parámetro       | Tipo   | Descripción                                       |
|-----------------|--------|---------------------------------------------------|
| `progressionId` | number | ID de la progresión a eliminar de los favoritos   |

**Body:** ninguno.

**Respuesta exitosa — 204 No Content**

Sin body de respuesta.

---

## Resumen de endpoints

> `🔒` = requiere `Authorization: Bearer <token>`

| Método   | Ruta                                         | Descripción                         | Auth | Respuesta |
|----------|----------------------------------------------|-------------------------------------|------|-----------|
| `GET`    | `/health`                                    | Health check                        |      | 200       |
| `POST`   | `/api/auth/register`                         | Registro de usuario                 |      | 201       |
| `POST`   | `/api/auth/login`                            | Login y obtención de token          |      | 200       |
| `GET`    | `/api/keys`                                  | Listar tonalidades                  | 🔒   | 200       |
| `GET`    | `/api/keys/:keyId/chords`                    | Listar acordes de una tonalidad     | 🔒   | 200       |
| `GET`    | `/api/progressions`                          | Listar progresiones visibles        | 🔒   | 200       |
| `POST`   | `/api/progressions`                          | Crear una progresión                | 🔒   | 201       |
| `POST`   | `/api/progressions/:progressionId/transpose` | Transponer una progresión           | 🔒   | 201       |
| `POST`   | `/api/favorites/:progressionId`              | Agregar a favoritos                 | 🔒   | 201       |
| `DELETE` | `/api/favorites/:progressionId`              | Eliminar de favoritos               | 🔒   | 204       |
