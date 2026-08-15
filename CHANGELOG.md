# CHANGELOG — RestoApp Taller de Refactorización

Todos los cambios notables se documentan aquí siguiendo el formato
[Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.0.0] — Refactorización completa (Taller MPA)

### Ejercicio 1 — Conversión a MPA

**Añadido**
- `login.html` — Página de autenticación con formulario accesible y semántico.
- `admin.html` — Panel de administración protegido por sesión activa.
- `index.html` — Reescrito como página de toma de pedidos del mesero.

**Eliminado**
- Toda la lógica mezclada en el `index.html` original (único archivo monolítico).

---

### Ejercicio 2 — Modularización JavaScript

**Añadido**
- `js/config.js` — Constantes centralizadas (`FIREBASE_MENU_URL`, `TAX_RATE`, `SESSION_KEY`).
  - _Eliminado:_ IVA hardcodeado `0.19` disperso en el código.
- `js/api.js` — Capa de acceso a datos con `fetchMenu()` y `createProduct()`.
  - _Eliminado:_ Lógica duplicada de normalización de datos de Firebase (if array / if object).
- `js/auth.js` — Módulo de autenticación con `login()`, `logout()`, `isAuthenticated()`, `requireAuth()`.
- `js/menu.js` — Módulo de menú con caché encapsulada y estados de carga/error.
- `js/pedidos.js` — Lógica de negocio pura: `calculateTotals()`, `validateOrderForm()`, `buildOrderSummaryHTML()`.
- `js/admin.js` — Controlador de la página admin con manejo de formulario y estado de envío.
- `css/styles.css` — Hoja de estilos unificada con design tokens (variables CSS), componentes y responsive.

**Cambiado**
- Todos los módulos usan **ES Modules** (`import`/`export`), eliminando variables globales del `window`.
- Event listeners enlazados programáticamente (`addEventListener`), eliminando todos los atributos `onclick=` del HTML.

---

### Ejercicio 3 — Mejora de autenticación y seguridad

**Cambiado**
- Variables globales `isLogged`, `ADMIN_USER`, `ADMIN_PASS` eliminadas del scope global.
- Sesión gestionada con `sessionStorage` (aislado por pestaña, no persiste al cerrar).
- `requireAuth()` protege `admin.html` ante acceso directo sin sesión activa.

**Nota para estudiantes**
> En producción, la validación de credenciales **debe ocurrir en el servidor**
> (backend o Firebase Authentication). Las credenciales de demostración en
> `auth.js` son únicamente un punto de partida para el taller.

---

### Ejercicio 4 — Limpieza y eliminación de código muerto

**Eliminado**
- `funcionObsoletaCalculoAnterior()` — función muerta que nunca se invocaba.
- `.clase_redundante_que_no_se_usa` — clase CSS sin uso.
- Todos los estilos inline (`style="..."`) del HTML.
- Variables con nombres crípticos: `a` → `menuSelect`, `b` → `quantity`, `p` → `unitPrice`.
- Uso de `var` — reemplazado por `const`/`let` en todo el código.

**Mejorado**
- Validaciones estrictas con `Number.isFinite()` en lugar de comparaciones laxas.
- Mensajes de error descriptivos y específicos en lugar de `alert("Error en datos")`.

---

### Ejercicio 5 — Buenas prácticas

**Cambiado**
- Lógica de negocio (`calculateTotals`) completamente separada de la manipulación del DOM.
- Función monolítica `tomarTodo()` descompuesta en:
  - `validateOrderForm()` — validación pura.
  - `calculateTotals()` — cálculo puro sin efectos secundarios.
  - `buildOrderSummaryHTML()` — presentación del resultado.
- Manejo de errores con `try/catch` en todas las llamadas `fetch`.
- Feedback al usuario durante carga del menú (estado deshabilitado + texto indicativo).
- Botón de envío deshabilitado durante peticiones asíncronas (previene doble envío).

---

## [0.1.0] — Código base legacy (punto de partida del taller)

- Archivo único `index.html` con variables globales, credenciales hardcodeadas,
  función monolítica `tomarTodo()`, código muerto, y CSS inline.
