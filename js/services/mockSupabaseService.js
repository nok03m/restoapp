/* =============================================
   supabaseService.js - Simulador de Supabase
   Datos mock con estructura lista para swap
   a cliente real de Supabase.
   ============================================= */

import { generateId, delay } from '../utils/helpers.js';

// --- Datos mock estáticos ---

const MOCK_PRODUCTOS = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    nombre: 'Burger Clásica',
    descripcion: 'Carne 200g, lechuga, tomate, salsa especial',
    precio: 12900,
    categoria: 'burgers',
    imagen_url: null,
    disponible: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    nombre: 'Burger Doble Queso',
    descripcion: 'Doble carne, doble queso cheddar, bacon crocante',
    precio: 17900,
    categoria: 'burgers',
    imagen_url: null,
    disponible: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    nombre: 'Papas Fritas Deluxe',
    descripcion: 'Con bacon, queso derretido y jalapeños',
    precio: 8500,
    categoria: 'acompañamientos',
    imagen_url: null,
    disponible: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    nombre: 'Limonada Neon',
    descripcion: 'Limonada natural con toque cyberpunk',
    precio: 4500,
    categoria: 'bebidas',
    imagen_url: null,
    disponible: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    nombre: 'Helado de Vainilla',
    descripcion: 'Helado artesanal de vainilla con topping de chocolate',
    precio: 5200,
    categoria: 'postres',
    imagen_url: null,
    disponible: false,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000006',
    nombre: 'Pizza Margarita',
    descripcion: 'Masa artesanal, mozzarella fresca, albahaca',
    precio: 22000,
    categoria: 'pizzas',
    imagen_url: null,
    disponible: true,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
];

const MOCK_PEDIDOS = [
  {
    id: 'p1000000-0001-4000-8000-000000000001',
    cliente_nombre: 'Juan Pérez',
    mesa: 'Mesa 3',
    estado: 'completado',
    notas: 'Sin cebolla',
    created_at: '2026-08-10T14:30:00Z',
    updated_at: '2026-08-10T15:00:00Z',
  },
  {
    id: 'p1000000-0002-4000-8000-000000000002',
    cliente_nombre: 'María López',
    mesa: 'Mesa 1',
    estado: 'pendiente',
    notas: null,
    created_at: '2026-08-18T12:00:00Z',
    updated_at: '2026-08-18T12:00:00Z',
  },
];

const MOCK_DETALLES = [
  {
    id: 'd1000000-0001-4000-8000-000000000001',
    pedido_id: 'p1000000-0001-4000-8000-000000000001',
    producto_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    cantidad: 2,
    precio_unitario: 12900,
  },
  {
    id: 'd1000000-0002-4000-8000-000000000002',
    pedido_id: 'p1000000-0001-4000-8000-000000000001',
    producto_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    cantidad: 1,
    precio_unitario: 8500,
  },
  {
    id: 'd1000000-0003-4000-8000-000000000003',
    pedido_id: 'p1000000-0002-4000-8000-000000000002',
    producto_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    cantidad: 1,
    precio_unitario: 17900,
  },
];

const MOCK_FACTURAS = [
  {
    id: 'f1000000-0001-4000-8000-000000000001',
    pedido_id: 'p1000000-0001-4000-8000-000000000001',
    subtotal: 34300,
    iva_porcentaje: 19.0,
    iva_monto: 6517,
    total: 40817,
    metodo_pago: 'tarjeta_credito',
    estado: 'pagada',
    created_at: '2026-08-10T15:05:00Z',
  },
];

// --- Estado en memoria (simula base de datos) ---
let productos = [...MOCK_PRODUCTOS];
let pedidos = [...MOCK_PEDIDOS];
let detalles = [...MOCK_DETALLES];
let facturas = [...MOCK_FACTURAS];

// ============================================
// PRODUCTOS - CRUD
// ============================================

/**
 * Obtiene todos los productos.
 * @param {object} filters - Filtros opcionales ({categoria, disponible}).
 * @returns {Promise<Array>}
 */
export async function getProductos(filters = {}) {
  await delay(200);
  let result = [...productos];
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
  await delay(100);
  return productos.find((p) => p.id === id) || null;
}

/**
 * Crea un nuevo producto.
 * @param {object} data - {nombre, descripcion, precio, categoria, disponible}
 * @returns {Promise<object>} Producto creado.
 */
export async function createProducto(data) {
  await delay(250);
  const nuevo = {
    id: generateId(),
    nombre: data.nombre,
    descripcion: data.descripcion || '',
    precio: Number(data.precio),
    categoria: data.categoria || 'general',
    imagen_url: data.imagen_url || null,
    disponible: data.disponible !== undefined ? data.disponible : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  productos.push(nuevo);
  return nuevo;
}

/**
 * Actualiza un producto existente.
 * @param {string} id
 * @param {object} data - Campos a actualizar.
 * @returns {Promise<object|null>} Producto actualizado o null.
 */
export async function updateProducto(id, data) {
  await delay(250);
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  productos[idx] = {
    ...productos[idx],
    ...data,
    id,
    updated_at: new Date().toISOString(),
  };
  return productos[idx];
}

/**
 * Elimina un producto por ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProducto(id) {
  await delay(200);
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  productos.splice(idx, 1);
  return true;
}

// ============================================
// PEDIDOS - CRUD
// ============================================

/**
 * Obtiene todos los pedidos.
 * @param {object} filters - Filtros opcionales ({estado}).
 * @returns {Promise<Array>}
 */
export async function getPedidos(filters = {}) {
  await delay(200);
  let result = [...pedidos];
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
  await delay(150);
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) return null;
  const items = detalles.filter((d) => d.pedido_id === id);
  return { ...pedido, items };
}

/**
 * Crea un pedido nuevo con sus detalles.
 * @param {object} data - {cliente_nombre, mesa, notas, items: [{producto_id, cantidad, precio_unitario}]}
 * @returns {Promise<object>} Pedido creado.
 */
export async function createPedido(data) {
  await delay(300);
  const pedido = {
    id: generateId(),
    cliente_nombre: data.cliente_nombre,
    mesa: data.mesa || '',
    estado: 'pendiente',
    notas: data.notas || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  pedidos.push(pedido);

  if (Array.isArray(data.items)) {
    data.items.forEach((item) => {
      detalles.push({
        id: generateId(),
        pedido_id: pedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      });
    });
  }

  return { ...pedido, items: detalles.filter((d) => d.pedido_id === pedido.id) };
}

/**
 * Actualiza el estado de un pedido.
 * @param {string} id
 * @param {string} estado
 * @returns {Promise<object|null>}
 */
export async function updatePedidoEstado(id, estado) {
  await delay(200);
  const idx = pedidos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pedidos[idx].estado = estado;
  pedidos[idx].updated_at = new Date().toISOString();
  return pedidos[idx];
}

/**
 * Elimina un pedido y sus detalles.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deletePedido(id) {
  await delay(200);
  const idx = pedidos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  pedidos.splice(idx, 1);
  detalles = detalles.filter((d) => d.pedido_id !== id);
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
  await delay(200);
  return [...facturas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Crea una factura a partir de un pedido.
 * @param {string} pedidoId
 * @param {object} extra - {metodo_pago}
 * @returns {Promise<object|null>} Factura creada.
 */
export async function createFactura(pedidoId, extra = {}) {
  await delay(300);
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return null;

  const itemsPedido = detalles.filter((d) => d.pedido_id === pedidoId);
  const subtotal = itemsPedido.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);
  const ivaPorcentaje = 19.0;
  const ivaMonto = Math.round(subtotal * (ivaPorcentaje / 100));
  const total = subtotal + ivaMonto;

  const factura = {
    id: generateId(),
    pedido_id: pedidoId,
    subtotal,
    iva_porcentaje: ivaPorcentaje,
    iva_monto: ivaMonto,
    total,
    metodo_pago: extra.metodo_pago || 'efectivo',
    estado: 'pagada',
    created_at: new Date().toISOString(),
  };
  facturas.push(factura);

  pedido.estado = 'completado';
  pedido.updated_at = new Date().toISOString();

  return factura;
}

// ============================================
// RESET (para testing)
// ============================================

/**
 * Restaura los datos mock originales.
 */
export function resetMockData() {
  productos = [...MOCK_PRODUCTOS];
  pedidos = [...MOCK_PEDIDOS];
  detalles = [...MOCK_DETALLES];
  facturas = [...MOCK_FACTURAS];
}
