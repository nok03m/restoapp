# RestoApp

Sistema de gestión de pedidos y facturación para restaurantes. Arquitectura MPA estática, sin bundler, vanilla ES6+ modules.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3 (Grid + Flexbox), JavaScript ES6+ modules |
| Backend | Firebase Realtime Database + Firebase Auth |
| Estilo | Tema cyberpunk neon (custom CSS, Canvas starfield, glitch transitions) |
| Fuentes | [Orbitron](https://fonts.google.com/specimen/Orbitron), [Rajdhani](https://fonts.google.com/specimen/Rajdhani), [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) |

## Estructura

```
restoapp/
├── index.html                  # Landing page
├── pages/
│   ├── login.html              # Autenticación
│   ├── pedidos.html            # Creación de pedidos
│   ├── admin.html              # Panel admin (productos + facturación)
│   ├── facturas.html           # Historial de facturas del usuario
│   └── reportes.html           # Dashboard de analíticas
├── css/
│   ├── styles.css              # Variables globales + reset
│   ├── cyberpunk.css           # Tema, animaciones, transiciones glitch
│   ├── layout.css              # Grid layout, navbar, sidebar
│   ├── components.css          # Cards, botones, tablas, formularios, modals
│   ├── admin.css               # Estilos del panel admin
│   └── reportes.css            # Estilos del dashboard de reportes
├── js/
│   ├── main.js                 # Bootstrap global
│   ├── auth.js                 # Lógica de login/logout
│   ├── services/
│   │   ├── firebaseConfig.js   # Inicialización Firebase
│   │   ├── firebaseService.js  # CRUD contra Firebase RTDB
│   │   ├── dataAdapter.js      # Fachada centralizada de servicios
│   │   └── authService.js      # Auth wrapper (login, sesión, roles)
│   ├── utils/
│   │   ├── helpers.js          # Formateo, utilidades DOM, toasts
│   │   ├── animations.js       # Efectos visuales (ripple, glitch, typewriter)
│   │   ├── starfield.js        # Canvas animado de estrellas
│   │   └── pageTransition.js   # Transiciones glitch entre páginas
│   └── modules/
│       ├── pedidos/            # Pedido: vista + lógica de negocio
│       ├── admin/              # Admin: productos CRUD + facturación
│       ├── facturas/           # Facturas del usuario autenticado
│       └── reportes/           # Dashboard analítico con Canvas charts
└── assets/
    └── logo.svg
```

## Inicio rápido

```bash
# Opción 1: cualquier servidor estático
npx serve .

# Opción 2: Python
python3 -m http.server 8080

# Opción 3: VS Code Live Server
```

Abrir `index.html` en el navegador.

## Autenticación

Credenciales de prueba (configuradas en Firebase):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@restoapp.com` | `admin123` | admin |
| `mesero@restoapp.com` | `mesero123` | usuario |

Las páginas `admin.html`, `facturas.html` y `reportes.html` requieren autenticación.

## Arquitectura

**Data Adapter Pattern** — Todos los módulos importan servicios desde `dataAdapter.js`. Cambiar de Firebase a otro backend requiere modificar únicamente ese archivo.

**Lógica separada de vista** — `pedidoLogic.js` contiene funciones puras de cálculo/validación desacopladas del DOM.

**Sin build step** — El proyecto ejecuta como archivos estáticos puros. No hay `node_modules` en producción, ni bundler, ni transpilación.

## Módulos principales

| Módulo | Función |
|--------|---------|
| `pedidoView` | Grid de menú, carrito, generación de factura |
| `productosView` | CRUD completo de productos con tabla, búsqueda y filtros |
| `facturacionView` | Reporte de facturación con stats y tabla de facturas |
| `facturasListView` | Historial de facturas del usuario con detalle modal |
| `reportesView` | KPIs animados, barras CSS, donut, ranking, gráfico Canvas con bezier |

## Paleta de colores

```
Negro       #000000    Fondos
Cian        #00FFFF    Acentos primarios
Púrpura     #6600CC    Acentos secundarios
Verde       #00FF00    Estados positivos
```

## Licencia

Proyecto educativo — Taller de Refactorización y Uso de IA.
