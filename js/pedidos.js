/**
 * @file pedidos.js
 * @description Módulo de pedidos — contiene la lógica de negocio
 * para calcular totales y procesar pedidos.
 * No conoce el DOM ni la API; solo opera sobre datos puros.
 */

import { TAX_RATE } from './config.js';

/**
 * @typedef {Object} OrderTotals
 * @property {number} subtotal  - Precio antes de impuestos.
 * @property {number} tax       - Monto del IVA.
 * @property {number} total     - Precio final incluyendo IVA.
 */

/**
 * Calcula los totales de un pedido a partir de cantidad y precio unitario.
 *
 * @param {number} quantity  - Cantidad de unidades solicitadas.
 * @param {number} unitPrice - Precio unitario del plato.
 * @returns {OrderTotals}
 * @throws {Error} Si la cantidad o el precio son inválidos.
 */
export function calculateTotals(quantity, unitPrice) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('La cantidad debe ser un número positivo.');
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error('El precio unitario debe ser un número no negativo.');
  }

  const subtotal = quantity * unitPrice;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

/**
 * Valida que los datos del formulario de pedido sean correctos.
 *
 * @param {{ itemKey: string, quantity: number, unitPrice: number }} formData
 * @returns {{ valid: boolean, message: string }}
 */
export function validateOrderForm({ itemKey, quantity, unitPrice }) {
  if (!itemKey) {
    return { valid: false, message: 'Selecciona un plato del menú.' };
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { valid: false, message: 'Ingresa una cantidad válida (mayor a 0).' };
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return { valid: false, message: 'El precio unitario no es válido.' };
  }
  return { valid: true, message: '' };
}

/**
 * Formatea el resumen de un pedido como cadena de texto legible.
 *
 * @param {string} itemName          - Nombre del plato pedido.
 * @param {OrderTotals} totals       - Totales calculados del pedido.
 * @returns {string} HTML listo para insertarse en el DOM.
 */
export function buildOrderSummaryHTML(itemName, totals) {
  const fmt = (n) => `$${n.toFixed(2)}`;
  return `
    <span class="summary__label">Plato:</span> ${itemName} &nbsp;|&nbsp;
    <span class="summary__label">Subtotal:</span> ${fmt(totals.subtotal)} &nbsp;|&nbsp;
    <span class="summary__label">IVA (${(TAX_RATE * 100).toFixed(0)}%):</span> ${fmt(totals.tax)} &nbsp;|&nbsp;
    <span class="summary__label">Total:</span> ${fmt(totals.total)}
  `.trim();
}
