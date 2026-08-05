# Ferretería Backend — Fase 1 + Fase 2

Backend en Spring Boot con modelo de datos completo, login con JWT, y ahora
CRUD de productos/categorías con control de stock.

## Qué incluye

### Fase 1
- **Modelo de datos (JPA / Postgres)**: `Usuario`, `Categoria`, `Producto`, `MovimientoStock`, `Venta`, `DetalleVenta`.
- **Autenticación JWT**: login en `/api/auth/login`, roles `ADMIN` y `VENDEDOR`.
- **Usuario admin automático**: se crea al arrancar la app por primera vez.

### Fase 2
- **CRUD de categorías**: `/api/categorias` (solo ADMIN puede crear/editar/borrar).
- **CRUD de productos**: `/api/productos` (solo ADMIN puede crear/editar/borrar; ADMIN y VENDEDOR pueden consultar).
- **Búsqueda por código de barras**: `GET /api/productos/codigo/{codigoBarras}` — pensado para el lector.
- **Búsqueda unificada** (nuevo): `GET /api/productos/buscar?q=texto` — un solo campo que busca por **nombre o código de barras** a la vez. Pensado para la pantalla de venta: el vendedor tipea el nombre, o escanea el código, y el mismo buscador encuentra el producto.
  - Si escaneás un código exacto y querés la búsqueda más rápida/estricta, `GET /api/productos/codigo/{codigoBarras}` sigue disponible (match exacto, no parcial).
  - `/buscar` hace match parcial (`LIKE %texto%`) tanto en nombre como en código, así sirve para autocompletar mientras se escribe.
- **Alerta de stock bajo**: `GET /api/productos/stock-bajo` — devuelve los productos con `stockActual <= stockMinimo`.
- **Ajuste manual de stock**: `POST /api/productos/{id}/ajustar-stock` — ingreso o descuento manual (rotura, ajuste de inventario, etc.), con motivo y trazabilidad en `MovimientoStock`. Lo puede hacer ADMIN o VENDEDOR.
- **Baja lógica**: borrar un producto no lo elimina de la base, lo marca `activo = false` (para no perder el historial de ventas asociado).

### Fase 3 (nuevo)
- **Registro de ventas**: `POST /api/ventas` — carrito con uno o más productos.
- **Descuento automático de stock**: cada producto vendido descuenta su stock y queda registrado en `MovimientoStock` (tipo `VENTA`).
- **Validación previa**: si algún producto no tiene stock suficiente, la venta entera se rechaza (no se descuenta nada a medias) — está dentro de una transacción `@Transactional`.
- **Métodos de pago**: `EFECTIVO`, `DEBITO`, `QR`.
- **Consulta de ventas**: `GET /api/ventas` (listado) y `GET /api/ventas/{id}` (detalle con sus items).
- Tanto ADMIN como VENDEDOR pueden registrar y consultar ventas.

### Fase 4 (nuevo)
- **Reporte del día**: `GET /api/reportes/ventas/hoy`
- **Reporte de la semana** (desde el lunes): `GET /api/reportes/ventas/semana`
- **Reporte del mes** (desde el día 1): `GET /api/reportes/ventas/mes`
- **Rango personalizado**: `GET /api/reportes/ventas?desde=2026-07-01&hasta=2026-07-31`
- **Productos más vendidos**: `GET /api/reportes/productos-mas-vendidos?desde=...&hasta=...&limite=10`
- Cada reporte trae: total vendido, cantidad de ventas, y el desglose por método de pago (efectivo/débito/QR) — así el front puede armar gráficos de torta o barras directamente con esos datos.
- **Nota de permisos**: dejé los reportes solo para ADMIN (facturación es información sensible del negocio). Si preferís que el VENDEDOR también pueda ver el reporte del día para controlar su propia caja, es un cambio de una línea en `SecurityConfig` — avisame y lo ajusto.

### Fase 4.5 (nuevo) — Gestión de usuarios
- **Crear usuarios**: `POST /api/usuarios` — solo ADMIN. Así ya no dependés de los usuarios semilla (`admin`/`vendedor`) para dar de alta empleados nuevos.
- **Listar usuarios**: `GET /api/usuarios` — solo ADMIN.
- **Habilitar / deshabilitar**: `PATCH /api/usuarios/{id}/habilitar` y `PATCH /api/usuarios/{id}/deshabilitar` — en vez de borrar un usuario (lo que rompería el historial de ventas asociado a él), se deshabilita: no puede loguearse pero sus ventas siguen intactas en los reportes.
- **Resetear contraseña de otro usuario**: `POST /api/usuarios/{id}/resetear-password` — solo ADMIN, para cuando un vendedor se olvida la suya.
- **Cambiar mi propia contraseña**: `POST /api/usuarios/mi-perfil/cambiar-password` — cualquier usuario logueado, requiere la contraseña actual.

## Endpoints de la Fase 2

Todos requieren el header `Authorization: Bearer <token>` (obtenido del login).

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| GET | `/api/categorias` | ADMIN, VENDEDOR | Listar categorías |
| POST | `/api/categorias` | ADMIN | Crear categoría |
| PUT | `/api/categorias/{id}` | ADMIN | Editar categoría |
| DELETE | `/api/categorias/{id}` | ADMIN | Borrar categoría |
| GET | `/api/productos` | ADMIN, VENDEDOR | Listar productos activos (opcional `?nombre=...`) |
| GET | `/api/productos/buscar?q=...` | ADMIN, VENDEDOR | Buscar por nombre O código de barras (mismo campo) |
| GET | `/api/productos/{id}` | ADMIN, VENDEDOR | Ver un producto |
| GET | `/api/productos/codigo/{codigoBarras}` | ADMIN, VENDEDOR | Buscar por código de barras exacto |
| GET | `/api/productos/stock-bajo` | ADMIN, VENDEDOR | Productos con stock bajo (alerta) |
| POST | `/api/productos` | ADMIN | Crear producto |
| PUT | `/api/productos/{id}` | ADMIN | Editar producto (no cambia stock) |
| DELETE | `/api/productos/{id}` | ADMIN | Baja lógica |
| POST | `/api/productos/{id}/ajustar-stock` | ADMIN, VENDEDOR | Ingreso/egreso manual de stock |
| POST | `/api/ventas` | ADMIN, VENDEDOR | Registrar una venta (descuenta stock automáticamente) |
| GET | `/api/ventas` | ADMIN, VENDEDOR | Listar todas las ventas |
| GET | `/api/ventas/{id}` | ADMIN, VENDEDOR | Ver el detalle de una venta |
| GET | `/api/reportes/ventas/hoy` | ADMIN | Resumen de ventas de hoy |
| GET | `/api/reportes/ventas/semana` | ADMIN | Resumen de ventas de la semana |
| GET | `/api/reportes/ventas/mes` | ADMIN | Resumen de ventas del mes |
| GET | `/api/reportes/ventas?desde=&hasta=` | ADMIN | Resumen de ventas en un rango |
| GET | `/api/reportes/productos-mas-vendidos?desde=&hasta=&limite=` | ADMIN | Top productos vendidos en un rango |
| GET | `/api/usuarios` | ADMIN | Listar todos los usuarios |
| POST | `/api/usuarios` | ADMIN | Crear un usuario (vendedor o admin) |
| PATCH | `/api/usuarios/{id}/habilitar` | ADMIN | Habilitar un usuario |
| PATCH | `/api/usuarios/{id}/deshabilitar` | ADMIN | Deshabilitar un usuario |
| POST | `/api/usuarios/{id}/resetear-password` | ADMIN | Resetear la contraseña de otro usuario |
| POST | `/api/usuarios/mi-perfil/cambiar-password` | Cualquier logueado | Cambiar mi propia contraseña |

### Ejemplo: crear un vendedor nuevo

```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer <TOKEN_DE_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "juan123456",
    "nombreCompleto": "Juan Pérez",
    "rol": "VENDEDOR"
  }'
```

### Ejemplo: reporte del día

```bash
curl http://localhost:8080/api/reportes/ventas/hoy \
  -H "Authorization: Bearer <TOKEN>"
```

Respuesta:
```json
{
  "desde": "2026-08-03T00:00:00",
  "hasta": "2026-08-04T00:00:00",
  "totalVendido": 45800.00,
  "cantidadVentas": 7,
  "totalPorMetodoPago": {"EFECTIVO": 25000.00, "DEBITO": 15800.00, "QR": 5000.00},
  "cantidadPorMetodoPago": {"EFECTIVO": 4, "DEBITO": 2, "QR": 1}
}
```

### Ejemplo: productos más vendidos del mes

```bash
curl "http://localhost:8080/api/reportes/productos-mas-vendidos?desde=2026-08-01&hasta=2026-08-31&limite=5" \
  -H "Authorization: Bearer <TOKEN>"
```

### Ejemplo: registrar una venta

```bash
curl -X POST http://localhost:8080/api/ventas \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "EFECTIVO",
    "items": [
      {"productoId": 1, "cantidad": 2},
      {"productoId": 3, "cantidad": 1}
    ]
  }'
```

La respuesta trae el total calculado y el detalle de cada item, con el precio
que tenía el producto en ese momento (aunque después cambie el precio de venta,
el historial de la venta queda intacto).

### Ejemplo: crear un producto

```bash
curl -X POST http://localhost:8080/api/productos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Martillo carpintero 20oz",
    "codigoBarras": "7791234567890",
    "categoriaId": 1,
    "precioCosto": 4500.00,
    "precioVenta": 7800.00,
    "stockActual": 15,
    "stockMinimo": 3,
    "unidadMedida": "unidad"
  }'
```

### Ejemplo: descontar stock manualmente (rotura, por ejemplo)

```bash
curl -X POST http://localhost:8080/api/productos/1/ajustar-stock \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tipo": "EGRESO_MANUAL", "cantidad": 2, "motivo": "Rotura en depósito"}'
```

## Requisitos

**Opción A — con Docker (recomendado, más simple):**
- Docker y Docker Compose instalados

**Opción B — sin Docker (todo instalado a mano):**
- Java 17+
- Maven 3.8+
- PostgreSQL 14+ corriendo localmente

---

## Opción A: levantar todo con Docker (Postgres + backend)

Esta es la forma más simple: un solo comando levanta la base de datos Y el backend, ya conectados entre sí.

### 1. Configurar variables de entorno (opcional)

```bash
cp .env.example .env
```

Editá `.env` si querés cambiar el usuario/contraseña de Postgres o el secreto JWT. Si no lo tocás, usa los valores por defecto (están bien para desarrollo).

### 2. Levantar todo

```bash
docker compose up --build
```

Esto crea dos contenedores:
- `ferreteria-db`: Postgres, con los datos guardados en un volumen (no se pierden si reiniciás)
- `ferreteria-backend`: el backend, esperando a que Postgres esté listo antes de arrancar

La primera vez vas a ver en los logs:
```
Usuario admin creado    -> username: admin / password: admin123
Usuario vendedor creado -> username: vendedor / password: vendedor123
```

El backend queda disponible en `http://localhost:8080`, igual que sin Docker.

### 3. Para pararlo

```bash
docker compose down
```

Los datos de la base **no se borran** (quedan en el volumen `ferreteria_db_data`). Si en algún momento querés borrar todo y arrancar de cero:

```bash
docker compose down -v
```

### Conectarte a la base de datos desde afuera (para ver las tablas con un cliente como DBeaver, pgAdmin, o el propio IntelliJ)

Con Docker corriendo, Postgres queda expuesto en tu máquina igual que si lo hubieras instalado local:
- Host: `localhost`
- Puerto: `5432`
- Base de datos: `ferreteria_db`
- Usuario: `postgres`
- Contraseña: `postgres` (o lo que hayas puesto en `.env`)

---

## Opción B: sin Docker (Postgres instalado a mano)

### 1. Crear la base de datos

```bash
psql -U postgres -f database-setup.sql
```

O manualmente:
```sql
CREATE DATABASE ferreteria_db;
```

### 2. Configurar credenciales

Si tu usuario/contraseña de Postgres no son `postgres/postgres`, definí las variables de entorno antes de arrancar (o editá directamente `src/main/resources/application.yml`):

```bash
export DB_USER=tu_usuario
export DB_PASSWORD=tu_password
```

### 3. Correr la app

```bash
mvn spring-boot:run
```

La primera vez vas a ver en la consola:
```
Usuario admin creado    -> username: admin / password: admin123
Usuario vendedor creado -> username: vendedor / password: vendedor123
```

Las tablas se crean solas (Hibernate `ddl-auto: update`).

---

## Probar el login (aplica a ambas opciones)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Te devuelve un JSON con el `token` JWT. Ese token se manda en el header
`Authorization: Bearer <token>` en el resto de los endpoints.

## Próximos pasos (siguientes fases)

- Fase 5: Frontend en React (login, productos, ventas, reportes, modo oscuro/claro)

## Notas sobre producción

Este setup de Docker está pensado para desarrollo. Antes de instalar esto en la PC real de la ferretería, conviene:
- Cambiar `JWT_SECRET` por un valor generado al azar (no dejar el default)
- Cambiar la contraseña del usuario `admin` apenas lo levantes la primera vez
- Considerar Flyway/Liquibase en vez de `ddl-auto: update` para manejar cambios futuros en la base de forma controlada
- Hacer backups periódicos del volumen de Postgres (`ferreteria_db_data`)
- Fase 4: Reportes diarios/semanales/mensuales
- Fase 5: Frontend en React (login, productos, ventas, reportes, modo oscuro/claro)
- Fase 6: Integración del lector de código de barras (funciona como teclado — no requiere driver especial)

## Estructura del proyecto

```
src/main/java/com/ferreteria/
  ├── model/         -> Entidades JPA
  ├── repository/     -> Interfaces Spring Data JPA
  ├── config/         -> Seguridad, JWT, datos iniciales
  ├── controller/      -> Endpoints REST (Auth, Categoria, Producto, Venta, Reporte, Usuario)
  ├── dto/            -> Objetos de entrada/salida de la API
  ├── exception/       -> Excepciones custom + manejo global de errores
  └── service/         -> Lógica de negocio (CategoriaService, ProductoService, VentaService, ReporteService, UsuarioService)
```
