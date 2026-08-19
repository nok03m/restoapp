/* =============================================
   dataAdapter.js - Adaptador de datos centralizado
   Punto único de importación de servicios.
   Actualmente usa Firebase RTDB + Auth.
   ============================================= */

import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedidoEstado,
  deletePedido,
  getFacturas,
  createFactura,
} from './firebaseService.js';

import {
  login,
  logout,
  getSession,
  isAuthenticated,
  hasRole,
  onAuthChange,
} from './authService.js';

// --- Exportar servicios organizados por dominio ---

export const ProductosService = {
  getAll: getProductos,
  getById: getProductoById,
  create: createProducto,
  update: updateProducto,
  delete: deleteProducto,
};

export const PedidosService = {
  getAll: getPedidos,
  getById: getPedidoById,
  create: createPedido,
  updateEstado: updatePedidoEstado,
  delete: deletePedido,
};

export const FacturasService = {
  getAll: getFacturas,
  create: createFactura,
};

export const AuthService = {
  login,
  logout,
  getSession,
  isAuthenticated,
  hasRole,
  onAuthChange,
};
