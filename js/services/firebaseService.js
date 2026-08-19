/* =============================================
   firebaseService.js - Servicio CRUD a Firebase RTDB
   Reemplaza al mock supabaseService.js.
   Usa la misma interfaz pública para que el
   dataAdapter no necesite cambios de API.
   ============================================= */

import { db } from './firebaseConfig.js';
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { generateId } from '../utils/helpers.js';

// Nodos de la RTDB
const NODOS = {
  productos: 'productos',
  pedidos: 'pedidos',
  detalles: 'detalles_pedido',
  facturas: 'facturas',
};

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Lee todos los registros de un nodo y los convierte en array.
 * @param {string} nodo
 * @returns {Promise<Array>}
 */
async function getAllFromNode(nodo) {
  const snapshot = await get(ref(db, nodo));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

/**
 * Lee registros de un nodo filtrados por un campo.
 * @param {string} nodo
 * @param {string} campo
 * @param {*} valor
 * @returns {Promise<Array>}
 */
async function getByField(nodo, campo, valor) {
  const q = query(ref(db, nodo), orderByChild(campo), equalTo(valor));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

// ============================================
// PRODUCTOS - CRUD
// ============================================

/**
 * Obtiene todos los productos.
 * @param {object} filters - {categoria, disponible}
 * @returns {Promise<Array>}
 */
export async function getProductos(filters = {}) {
  let result = await getAllFromNode(NODOS.productos);

  if (filters.categoria) {
    result = result.filter((p) => p.categoria === filters.categoria);
  }
  if (typeof filters.disponible === 'boolean') {
    result = result.filter((p) => p.disponible === filters.disponible);
  }

  return result;
}

/**
 * Obtiene un producto por ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getProductoById(id) {
  const snapshot = await get(ref(db, `${NODOS.productos}/${id}`));
  if (!snapshot.exists()) return null;
  return { id, ...snapshot.val() };
}

/**
 * Crea un nuevo producto.
 * @param {object} data
 * @returns {Promise<object>} Producto creado con ID.
 */
export async function createProducto(data) {
  const id = generateId();
  const producto = {
    nombre: data.nombre,
    descripcion: data.descripcion || '',
    precio: Number(data.precio),
    categoria: data.categoria || 'general',
    imagen_url: data.imagen_url || null,
    disponible: data.disponible !== undefined ? data.disponible : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await set(ref(db, `${NODOS.productos}/${id}`), producto);
  return { id, ...producto };
}

/**
 * Actualiza un producto existente.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
export async function updateProducto(id, data) {
  const existing = await getProductoById(id);
  if (!existing) return null;

  const updates = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  await update(ref(db, `${NODOS.productos}/${id}`), updates);
  return { id, ...existing, ...updates };
}

/**
 * Elimina un producto por ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProducto(id) {
  const existing = await getProductoById(id);
  if (!existing) return false;
  await remove(ref(db, `${NODOS.productos}/${id}`));
  return true;
}

// ============================================
// PEDIDOS - CRUD
// ============================================

/**
 * Obtiene todos los pedidos.
 * @param {object} filters - {estado}
 * @returns {Promise<Array>}
 */
export async function getPedidos(filters = {}) {
  let result = await getAllFromNode(NODOS.pedidos);

  if (filters.estado) {
    result = result.filter((p) => p.estado === filters.estado);
  }

  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Obtiene un pedido por ID con sus detalles.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getPedidoById(id) {
  const snapshot = await get(ref(db, `${NODOS.pedidos}/${id}`));
  if (!snapshot.exists()) return null;

  const pedido = { id, ...snapshot.val() };
  const items = await getByField(NODOS.detalles, 'pedido_id', id);
  return { ...pedido, items };
}

/**
 * Crea un pedido nuevo con sus detalles.
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createPedido(data) {
  const pedidoId = generateId();
  const pedido = {
    cliente_nombre: data.cliente_nombre,
    mesa: data.mesa || '',
    estado: 'pendiente',
    notas: data.notas || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await set(ref(db, `${NODOS.pedidos}/${pedidoId}`), pedido);

  // Guardar detalles
  const itemsGuardados = [];
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      const detalleId = generateId();
      const detalle = {
        pedido_id: pedidoId,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      };
      await set(ref(db, `${NODOS.detalles}/${detalleId}`), detalle);
      itemsGuardados.push({ id: detalleId, ...detalle });
    }
  }

  return { id: pedidoId, ...pedido, items: itemsGuardados };
}

/**
 * Actualiza el estado de un pedido.
 * @param {string} id
 * @param {string} estado
 * @returns {Promise<object|null>}
 */
export async function updatePedidoEstado(id, estado) {
  const existing = await getPedidoById(id);
  if (!existing) return null;

  await update(ref(db, `${NODOS.pedidos}/${id}`), {
    estado,
    updated_at: new Date().toISOString(),
  });

  return { id, ...existing, estado };
}

/**
 * Elimina un pedido y sus detalles.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deletePedido(id) {
  const existing = await getPedidoById(id);
  if (!existing) return false;

  // Eliminar detalles asociados
  const detalles = await getByField(NODOS.detalles, 'pedido_id', id);
  for (const d of detalles) {
    await remove(ref(db, `${NODOS.detalles}/${d.id}`));
  }

  await remove(ref(db, `${NODOS.pedidos}/${id}`));
  return true;
}

// ============================================
// FACTURAS
// ============================================

/**
 * Obtiene todas las facturas.
 * @returns {Promise<Array>}
 */
export async function getFacturas() {
  const result = await getAllFromNode(NODOS.facturas);
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Crea una factura a partir de un pedido.
 * @param {string} pedidoId
 * @param {object} extra - {metodo_pago}
 * @returns {Promise<object|null>}
 */
export async function createFactura(pedidoId, extra = {}) {
  const pedido = await getPedidoById(pedidoId);
  if (!pedido || !pedido.items) return null;

  const subtotal = pedido.items.reduce(
    (sum, d) => sum + d.cantidad * d.precio_unitario,
    0
  );
  const ivaPorcentaje = 19.0;
  const ivaMonto = Math.round(subtotal * (ivaPorcentaje / 100));
  const total = subtotal + ivaMonto;

  const facturaId = generateId();
  const factura = {
    pedido_id: pedidoId,
    subtotal,
    iva_porcentaje: ivaPorcentaje,
    iva_monto: ivaMonto,
    total,
    metodo_pago: extra.metodo_pago || 'efectivo',
    estado: 'pagada',
    created_at: new Date().toISOString(),
  };

  await set(ref(db, `${NODOS.facturas}/${facturaId}`), factura);

  // Marcar pedido como completado
  await update(ref(db, `${NODOS.pedidos}/${pedidoId}`), {
    estado: 'completado',
    updated_at: new Date().toISOString(),
  });

  return { id: facturaId, ...factura };
}
