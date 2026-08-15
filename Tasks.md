RestoApp - Taller de Refactorización y Uso de IA

Resumen
- Proyecto base (legacy) para que estudiantes practiquen refactorización: [index.html](index.html).
- Contiene malas prácticas intencionales (variables globales, autenticación en cliente, lógica monolítica) pero es funcional y conectado a Firebase Realtime Database en:
  https://stock-flow-2e23e-default-rtdb.firebaseio.com/menu.json

Objetivo del taller
- Transformar esta base en una MPA (Multiple Page Application) bien estructurada y modular.
- Enseñar a usar la IA como asistente para revisar, proponer y aplicar refactorizaciones.

Instrucciones rápidas
1. Abrir `index.html` en el navegador (doble clic). El proyecto es estático.
2. Revisar el código y buscar los TODOs y comentarios que indican malas prácticas.

Ejercicios sugeridos (orden recomendado)
- Ejercicio 1 — Convertir a MPA
  - Separar vistas en varios archivos HTML (p. ej. `index.html`, `login.html`, `admin.html`, `pedido.html`).
  - Mantener un único `styles.css` en `css/styles.css` y enlazarlo desde cada HTML.

- Ejercicio 2 — Modularizar JavaScript
  - Extraer funciones a archivos JS por responsabilidad (p. ej. `menu.js`, `auth.js`, `pedidos.js`).
  - Evitar variables globales; usar módulos ES o patrones IIFE.

- Ejercicio 3 — Mejorar autenticación y seguridad
  - No dejar credenciales en cliente. Implementar (si se desea) un backend mínimo o usar Firebase Auth.
  - Agregar reglas de seguridad en Realtime Database para restringir escritura.

- Ejercicio 4 — Limpieza y pruebas
  - Eliminar código muerto y funciones obsoletas.
  - Añadir validaciones más estrictas y mensajes de error más claros.
  - Escribir pruebas manuales o automatizadas (si conocen alguna herramienta simple).

- Ejercicio 5 — Buenas prácticas
  - Separar lógica de negocio de manipulación DOM.
  - Añadir manejo de errores robusto y feedback al usuario.

Uso de la IA como asistente
- Pide a la IA que haga cambios pequeños y justificables: "Refactoriza `tomarTodo()` separando cálculos de impuestos.".
- Ejemplos de prompts útiles:
  - "Sugiéreme una estructura de archivos para convertir esto en una MPA." 
  - "Refactoriza este archivo para eliminar variables globales y exportar funciones como módulo." 
  - "Detecta y lista las malas prácticas en `index.html`." 
- Pide a la IA que aplique cambios con parches (apply_patch) y que deje comentarios TODO para los estudiantes.

Entregables esperados
- Una versión MPA con archivos HTML separados.
- Un archivo `css/styles.css` que unifique estilos.
- Carpeta `js/` con módulos claros y sin variables globales.
- Un breve `CHANGELOG.md` o un PR/commit donde se describan las refactorizaciones.

Notas finales
- El repositorio contiene intencionalmente malas prácticas para que los estudiantes las identifiquen y corrijan.
- Mantener un flujo de trabajo en branches y commits pequeños ayuda a usar la IA para revisiones iterativas.

Si quieres, puedo:
- Añadir comentarios TODO directamente dentro de `index.html` para guiar a los estudiantes.
- Generar una estructura de archivos inicial (carpetas `css/`, `js/`, `pages/`) y mover/crear archivos básicos.

Autor: Instructor (plantilla para taller)
