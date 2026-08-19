/* =============================================
   adminView.js - Orquestador del Panel Admin
   Inicializa submódulos cuando la sesión está activa.
   ============================================= */

import { AuthService, ProductosService, FacturasService } from '../../services/dataAdapter.js';
import { formatCurrency, $ } from '../../utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.isAuthenticated()) return;

  const session = AuthService.getSession();
  if (!session) return;

  console.log(`[AdminView] Sesión activa: ${session.nombre} (${session.rol})`);

  // Cargar estadísticas del dashboard
  await loadDashboardStats();
});

/**
 * Carga y muestra estadísticas rápidas en el admin.
 */
async function loadDashboardStats() {
  try {
    const [productos, facturas] = await Promise.all([
      ProductosService.getAll(),
      FacturasService.getAll(),
    ]);

    const totalProductos = productos.length;
    const productosDisponibles = productos.filter((p) => p.disponible).length;
    const totalFacturas = facturas.length;
    const totalVentas = facturas.reduce((sum, f) => sum + f.total, 0);

    // Actualizar stats si existen los elementos
    const statsProductos = $('statProductos');
    const statsFacturas = $('statFacturas');
    const statsVentas = $('statVentas');

    if (statsProductos) statsProductos.textContent = totalProductos;
    if (statsFacturas) statsFacturas.textContent = totalFacturas;
    if (statsVentas) statsVentas.textContent = formatCurrency(totalVentas);
  } catch (err) {
    console.warn('[AdminView] Error cargando stats:', err);
  }
}
