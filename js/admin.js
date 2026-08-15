/**
 * @file admin.js
 * @description Módulo de administración — gestiona la creación de productos
 * y la lógica de la página admin.html.
 */

import { createProduct } from './api.js';
import { logout, requireAuth } from './auth.js';
import { loadPaginatedMenu } from './menu.js';

/**
 * Inicializa la página de administración.
 * Protege la ruta y enlaza los event listeners.
 *
 * @returns {Promise<void>}
 */
export async function initAdminPage() {
  await requireAuth();

  const form = document.getElementById('product-form');
  const logoutBtn = document.getElementById('logout-btn');
  const menuList = document.getElementById('menu-list');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (menuList) {
    loadPaginatedMenu(menuList, loadMoreBtn);
  }

  form?.addEventListener('submit', handleCreateProduct);
  logoutBtn?.addEventListener('click', handleLogout);
}

// ---------------------------------------------------------------------------
// Handlers de eventos
// ---------------------------------------------------------------------------

/**
 * Maneja el envío del formulario de creación de producto.
 *
 * @param {SubmitEvent} event
 */
async function handleCreateProduct(event) {
  event.preventDefault();

  const nameInput = document.getElementById('product-name');
  const priceInput = document.getElementById('product-price');
  const messageEl = document.getElementById('product-message');

  const validation = validateProductForm(nameInput.value, priceInput.value);
  if (!validation.valid) {
    showMessage(messageEl, validation.message, 'error');
    return;
  }

  const product = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
  };

  setFormState(true);
  showMessage(messageEl, 'Creando producto…', 'info');

  try {
    await createProduct(product);
    showMessage(messageEl, `✓ "${product.name}" creado exitosamente.`, 'success');
    event.target.reset();

    // Recargar la lista paginada del menú para incluir el nuevo producto
    const menuList = document.getElementById('menu-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (menuList) loadPaginatedMenu(menuList, loadMoreBtn);
  } catch (error) {
    console.error('[admin] Error al crear producto:', error);
    showMessage(messageEl, 'No se pudo crear el producto. Intenta de nuevo.', 'error');
  } finally {
    setFormState(false);
  }
}

/**
 * Maneja el cierre de sesión.
 */
async function handleLogout() {
  await logout();
  window.location.href = 'login.html';
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Valida los datos del formulario de producto.
 *
 * @param {string} name  - Nombre del producto.
 * @param {string} price - Precio como cadena.
 * @returns {{ valid: boolean, message: string }}
 */
function validateProductForm(name, price) {
  if (!name.trim()) {
    return { valid: false, message: 'El nombre del producto es obligatorio.' };
  }
  const parsedPrice = parseFloat(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return { valid: false, message: 'El precio debe ser un número mayor a cero.' };
  }
  return { valid: true, message: '' };
}

/**
 * Muestra un mensaje de estado en el elemento dado.
 *
 * @param {HTMLElement} element
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showMessage(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message form-message--${type}`;
}

/**
 * Habilita o deshabilita los controles del formulario durante el envío.
 *
 * @param {boolean} isLoading
 */
function setFormState(isLoading) {
  const submitBtn = document.getElementById('create-btn');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Creando…' : 'Crear producto';
  }
}
