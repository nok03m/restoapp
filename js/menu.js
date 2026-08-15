/**
 * @file menu.js
 * @description Módulo de menú — responsable de cargar los datos desde la API
 * y de renderizar las opciones en el DOM.
 * No realiza cálculos de negocio ni manipula otras partes de la UI.
 */

import { fetchMenu } from './api.js';

/**
 * Caché local del menú (id → { name, price }).
 * Encapsulada en el módulo; no es una variable global del window.
 *
 * @type {Object.<string, { name: string, price: number }>}
 */
let menuCache = {};

/**
 * Carga el menú desde la API, puebla el elemento <select> recibido
 * y actualiza la caché interna del módulo.
 *
 * @param {HTMLSelectElement} selectElement - El <select> a poblar.
 * @returns {Promise<void>}
 */
export async function loadMenu(selectElement) {
  setLoadingState(selectElement, true);

  try {
    menuCache = await fetchMenu();
    renderMenuOptions(selectElement, menuCache);
  } catch (error) {
    console.error('[menu] Error al cargar el menú:', error);
    renderErrorState(selectElement);
  } finally {
    setLoadingState(selectElement, false);
  }
}

/**
 * Devuelve el precio unitario de un ítem por su clave del menú.
 *
 * @param {string} key - Clave del ítem en el menú.
 * @returns {number} Precio unitario, o 0 si la clave no existe.
 */
export function getPriceByKey(key) {
  return menuCache[key]?.price ?? 0;
}

/**
 * Devuelve el nombre de un ítem por su clave del menú.
 *
 * @param {string} key - Clave del ítem en el menú.
 * @returns {string} Nombre del ítem, o cadena vacía si no existe.
 */
export function getNameByKey(key) {
  return menuCache[key]?.name ?? '';
}

/**
 * Carga el menú desde la API y renderiza una lista paginada de 10 en 10
 * con un botón "Mostrar más".
 *
 * @param {HTMLElement} listElement - Elemento <ul> donde renderizar la lista.
 * @param {HTMLButtonElement} loadMoreBtn - Botón "Mostrar más".
 * @returns {Promise<void>}
 */
export async function loadPaginatedMenu(listElement, loadMoreBtn) {
  if (!listElement) return;

  listElement.innerHTML = '<li class="menu-list__loading">Cargando menú…</li>';
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';

  try {
    menuCache = await fetchMenu();
    const items = Object.entries(menuCache).map(([id, item]) => ({ id, ...item }));
    const PAGE_SIZE = 10;
    let visibleCount = PAGE_SIZE;

    const render = () => {
      if (items.length === 0) {
        listElement.innerHTML = '<li class="menu-list__empty">No hay productos disponibles.</li>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
      }

      const visibleItems = items.slice(0, visibleCount);
      listElement.innerHTML = visibleItems
        .map(
          item => `
        <li class="menu-list__item">
          <span class="menu-list__name">${escapeHtml(item.name)}</span>
          <span class="menu-list__price">$${item.price.toFixed(2)}</span>
        </li>
      `
        )
        .join('');

      if (loadMoreBtn) {
        if (visibleCount < items.length) {
          loadMoreBtn.style.display = 'block';
        } else {
          loadMoreBtn.style.display = 'none';
        }
      }
    };

    render();

    if (loadMoreBtn) {
      // Remover listener previo si existía mediante reemplazo del elemento botón
      const newBtn = loadMoreBtn.cloneNode(true);
      loadMoreBtn.parentNode?.replaceChild(newBtn, loadMoreBtn);

      newBtn.addEventListener('click', () => {
        visibleCount += PAGE_SIZE;
        render();
      });
    }
  } catch (error) {
    console.error('[menu] Error al cargar el menú paginado:', error);
    listElement.innerHTML =
      '<li class="menu-list__empty">Error al cargar el menú. Recarga la página.</li>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  }
}

/**
 * Escapa HTML para prevenir inyecciones XSS en el renderizado de texto.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Helpers privados de renderizado
// ---------------------------------------------------------------------------

/**
 * Muestra u oculta el estado de carga en el select.
 *
 * @param {HTMLSelectElement} selectElement
 * @param {boolean} isLoading
 */
function setLoadingState(selectElement, isLoading) {
  selectElement.disabled = isLoading;
  if (isLoading) {
    selectElement.innerHTML = '<option value="">Cargando menú…</option>';
  }
}

/**
 * Renderiza las opciones del menú en el select.
 *
 * @param {HTMLSelectElement} selectElement
 * @param {Object} menu - Mapa id → { name, price }.
 */
function renderMenuOptions(selectElement, menu) {
  const placeholder = '<option value="">— Selecciona un plato —</option>';
  const options = Object.entries(menu)
    .map(([id, { name, price }]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${name} ($${price.toFixed(2)})`;
      return opt.outerHTML;
    })
    .join('');

  selectElement.innerHTML = placeholder + options;
}

/**
 * Muestra el estado de error en el select.
 *
 * @param {HTMLSelectElement} selectElement
 */
function renderErrorState(selectElement) {
  selectElement.innerHTML =
    '<option value="">Error al cargar el menú. Recarga la página.</option>';
}

