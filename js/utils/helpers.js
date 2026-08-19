/* =============================================
   helpers.js - Funciones de utilidad generales
   ============================================= */

/**
 * Formatea un número como moneda colombiana (COP).
 * @param {number} amount - Valor a formatear.
 * @returns {string} Ejemplo: "$12.900"
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '$0';
  return '$' + num.toLocaleString('es-CO');
}

/**
 * Genera un UUID v4 simple (para mocks).
 * @returns {string}
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calcula el subtotal, IVA y total de una lista de ítems.
 * @param {Array<{cantidad: number, precio_unitario: number}>} items
 * @param {number} ivaRate - Tasa de IVA (default 0.19 = 19%).
 * @returns {{subtotal: number, iva: number, total: number}}
 */
export function calcularTotales(items, ivaRate = 0.19) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.cantidad * item.precio_unitario;
  }, 0);
  const iva = Math.round(subtotal * ivaRate);
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

/**
 * Muestra un toast de notificación.
 * @param {string} message - Mensaje a mostrar.
 * @param {'success'|'error'|'info'} type - Tipo de toast.
 * @param {number} duration - Duración en ms (default 3000).
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Abre el modal global con contenido dinámico.
 * @param {string} title
 * @param {string} bodyHTML
 * @param {string} [footerHTML]
 */
export function openModal(title, bodyHTML, footerHTML = '') {
  const overlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');

  if (!overlay) return;

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalFooter.innerHTML = footerHTML;
  overlay.classList.add('modal-overlay--active');
}

/**
 * Cierra el modal global.
 */
export function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('modal-overlay--active');
  }
}

/**
 * Capitaliza la primera letra de un string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Obtiene una referencia segura a un elemento del DOM.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * Retardo simple con Promise (para simular latencia de red).
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
