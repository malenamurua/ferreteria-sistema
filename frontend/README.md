# Ferretería Frontend

Interfaz en React (Vite) para el sistema de gestión. Se conecta al backend
de Spring Boot vía API REST.

## Qué incluye

- **Login** con JWT (se guarda el token en `localStorage`)
- **Panel principal**: alerta de stock bajo + resumen de ventas del día
- **Vender**: pantalla de venta con buscador por nombre o código de barras (lista para el lector), carrito, y selección de método de pago (efectivo/débito/QR)
- **Productos**: catálogo con búsqueda, alta/edición, ingreso/descuento manual de stock, baja lógica
- **Historial de ventas**: cada venta con **fecha y hora exacta**, detalle de items al hacer click
- **Reportes** (solo ADMIN): hoy/semana/mes, rango personalizado, productos más vendidos
- **Usuarios** (solo ADMIN): alta de vendedores, habilitar/deshabilitar, resetear contraseña
- **Modo oscuro / claro**: toggle en la barra superior, se recuerda entre sesiones

## Identidad visual

Paleta "taller industrial": grafito + amarillo de seguridad (como el de las
herramientas y la cinta de precaución), con azul acero como acento secundario.
Tipografía Archivo (títulos) + Inter (texto) + IBM Plex Mono (precios, códigos,
fechas) para que los datos numéricos se lean claro.

## Requisitos

- Node.js 18+ y npm
- El backend corriendo (ver el README del backend) — por defecto se espera en `http://localhost:8080`

## Cómo levantarlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la URL del backend (opcional)

```bash
cp .env.example .env
```

Si tu backend corre en otra URL/puerto, editá `VITE_API_URL` en `.env`.

### 3. Correr en modo desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. Con el backend corriendo en el puerto 8080,
ya deberías poder loguearte con `admin` / `admin123` (o `vendedor` / `vendedor123`).

> **Importante**: el backend tiene CORS configurado para aceptar pedidos desde
> `http://localhost:5173`. Si corrés el frontend en otro puerto, hay que agregarlo
> en `SecurityConfig.java` del backend (`corsConfigurationSource`).

### 4. Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos listos para servir
(por ejemplo, con Nginx, o copiándolos a donde sirva el backend).

## Estructura del proyecto

```
src/
  ├── api/          -> Funciones que llaman a cada endpoint del backend
  ├── context/      -> AuthContext (usuario logueado) y ThemeContext (modo oscuro/claro)
  ├── components/   -> Piezas reutilizables: Layout, Modal, Boton, Input, etc.
  ├── pages/        -> Una pantalla por archivo (Login, Dashboard, Vender, Productos, etc.)
  └── utils/        -> Formato de fechas (con hora) y moneda
```

## Próximos pasos posibles

- Conectar un lector de código de barras físico (USB): funciona "de fábrica" en
  la pantalla de Vender, porque el lector actúa como un teclado — escanea y
  aprieta Enter solo, y el buscador ya está preparado para interceptar eso.
- Impresión de tickets/comprobantes
- Paginación en las tablas grandes
