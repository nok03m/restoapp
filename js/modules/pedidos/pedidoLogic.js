/* =============================================
   pedidoLogic.js - Lógica de negocio del módulo Pedidos
   Separada de la UI para mantener separación
   de responsabilidades.
   ============================================= */

/** Tasa de IVA por defecto (19%) */
export const IVA_RATE = 0.19;

/**
 * Calcula el subtotal de una línea individual.
 * @param {number} cantidad
 * @param {number} precioUnitario
 * @returns {number}
 */
export function calcularSubtotalLinea(cantidad, precioUnitario) {
  return cantidad * precioUnitario;
}

/**
 * Calcula subtotal, IVA y total de un conjunto de ítems.
 * @param {Array<{cantidad: number, precio_unitario: number}>} items
 * @param {number} tasaIva - Decimal (0.19 = 19%)
 * @returns {{subtotal: number, iva: number, total: number, itemCount: number}}
 */
export function calcularTotalesPedido(items, tasaIva = IVA_RATE) {
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  );
  const iva = Math.round(subtotal * tasaIva);
  const total = subtotal + iva;
  return { subtotal, iva, total, itemCount };
}

/**
 * Valida que un pedido tenga los datos mínimos requeridos.
 * @param {object} pedido - {cliente_nombre, items, mesa}
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validarPedido(pedido) {
  const errors = [];

  if (!pedido.cliente_nombre || pedido.cliente_nombre.trim() === '') {
    errors.push('El nombre del cliente es requerido');
  }

  if (pedido.cliente_nombre && pedido.cliente_nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!pedido.items || pedido.items.length === 0) {
    errors.push('Agrega al menos un producto al pedido');
  }

  if (pedido.items) {
    pedido.items.forEach((item, idx) => {
      if (!item.producto_id) {
        errors.push(`Ítem ${idx + 1}: producto no válido`);
      }
      if (!item.cantidad || item.cantidad <= 0) {
        errors.push(`Ítem ${idx + 1}: la cantidad debe ser mayor a 0`);
      }
      if (item.cantidad > 99) {
        errors.push(`Ítem ${idx + 1}: cantidad máxima 99`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Genera el resumen textual de un pedido.
 * @param {object} pedido
 * @returns {string}
 */
export function generarResumenPedido(pedido) {
  if (!pedido || !pedido.items || pedido.items.length === 0) return '';

  const lineas = pedido.items.map(
    (item) => `${item.nombre || 'Producto'} x${item.cantidad}`
  );

  return `Pedido de ${pedido.cliente_nombre}: ${lineas.join(', ')}`;
}

/**
 * Formatea la fecha para mostrar en la factura.
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatFechaFactura(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
