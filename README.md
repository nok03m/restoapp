# 🍽️ RestoApp

Sistema web de gestión de pedidos y administración de menú para restaurantes.

> 🔑 **Credenciales de prueba**
> - **Email:** `test@mail.com`
> - **Contraseña:** `test123456`

---

## 🚀 Funcionalidades

- **Autenticación de Usuarios:** Control de acceso mediante Supabase Auth (`login.html`).
- **Toma de Pedidos:** Selección de platos, cálculo automático de precios e impuestos con resumen de compra (`index.html`).
- **Gestión de Menú (Admin):** Creación de nuevos platos y visualización paginada (10 por 10) de los productos activos (`admin.html`).

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, Vanilla CSS, JavaScript ES Modules.
- **Backend & Base de Datos:** Supabase (PostgreSQL & Auth).
- **Despliegue / Build:** Node.js (script de inyección de variables de entorno) y Vercel.

---

## 📁 Estructura del Proyecto

```text
restoapp/
├── admin.html          # Vista de administración de platos
├── index.html          # Vista principal de toma de pedidos
├── login.html          # Vista de inicio de sesión
├── build.js            # Script para generar js/env.js en despliegue/local
├── css/
│   └── styles.css      # Hoja de estilos unificada
├── js/
│   ├── admin.js        # Lógica de administración
│   ├── api.js          # Conexión y consultas a Supabase
│   ├── auth.js         # Autenticación y control de sesiones
│   ├── config.js       # Configuración e inicialización de cliente Supabase
│   ├── menu.js         # Carga y paginación del menú
│   └── pedidos.js      # Lógica de negocio para toma de pedidos
└── supabase/
    └── migrations/     # Scripts SQL para creación y poblado de tablas
```

---

## 💻 Ejecución Local

1. Configurar variables de entorno (copiar `env.example.js` o definir `.env`):
   ```bash
   SUPABASE_URL=tu_supabase_url
   SUPABASE_ANON_KEY=tu_supabase_key
   ```
2. Generar el archivo de configuración:
   ```bash
   npm run build
   ```
3. Servir los archivos estáticos en cualquier servidor web local (ej. Live Server).
