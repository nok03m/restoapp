/* =============================================
   facturacionView.js - UI de Reportes de Facturas (Admin)
   ============================================= */

import { FacturasService, PedidosService } from '../../services/dataAdapter.js';
import { AuthService } from '../../services/dataAdapter.js';
import { formatCurrency, $ } from '../../utils/helpers.js';
import { formatFechaFactura } from '../pedidos/pedidoLogic.js';

let cachedFacturas = [];

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.isAuthenticated()) return;

  const container = $('adminFacturacionContainer');
  if (!container) return;

  await loadFacturas(container);
});

export async function loadFacturas(container) {
  try {
    container.innerHTML = renderLoading();
    const facturas = await FacturasService.getAll();
    cachedFacturas = facturas;
    await renderFacturacion(container, facturas);
  } catch (err) {
    console.error('[FacturacionView] Error:', err);
    container.innerHTML = renderError();
  }
}

async function renderFacturacion(container, facturas) {
  const totalVentas = facturas.reduce((sum, f) => sum + f.total, 0);
  const totalIva = facturas.reduce((sum, f) => sum + f.iva_monto, 0);
  const cantidadFacturas = facturas.length;

  // Enriquecer facturas con datos del pedido
  const facturasEnriquecidas = await Promise.all(
    facturas.map(async (f) => {
      try {
        const pedido = await PedidosService.getById(f.pedido_id);
        return { ...f, cliente_nombre: pedido?.cliente_nombre || 'N/A', mesa: pedido?.mesa || '' };
      } catch {
        return { ...f, cliente_nombre: 'N/A', mesa: '' };
      }
    })
  );

  container.innerHTML = `
    <!-- Stats -->
    <div class="stats-grid mb-lg">
      <div class="stat-card">
        <div class="stat-card__label">Total Facturas</div>
        <div class="stat-card__value">${cantidadFacturas}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Ventas Totales</div>
        <div class="stat-card__value stat-card__value--yellow">${formatCurrency(totalVentas)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">IVA Recaudado</div>
        <div class="stat-card__value stat-card__value--magenta">${formatCurrency(totalIva)}</div>
      </div>
    </div>

    <!-- Tabla de facturas -->
    <div class="table-wrapper">
      <table class="table admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Mesa</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${facturasEnriquecidas.length === 0
            ? renderEmptyRow()
            : facturasEnriquecidas.map((f, idx) => renderFacturaRow(f, idx + 1)).join('')}
        </tbody>
      </table>
    </div>

    ${facturasEnriquecidas.length > 0 ? `
    <div class="text-right mt-md">
      <button class="btn btn--ghost btn--sm" id="refreshFacturasBtn">&#8635; Actualizar</button>
    </div>
    ` : ''}
  `;

  // Bind refresh
  $('refreshFacturasBtn')?.addEventListener('click', () => loadFacturas(container));
}

function renderFacturaRow(factura, index) {
  const fecha = formatFechaFactura(factura.created_at);

  const metodoLabel = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'TC',
    tarjeta_debito: 'TD',
    transferencia: 'Transf.',
  };

  const estadoClass = factura.estado === 'pagada' ? 'badge--green' : 'badge--red';

  return `
    <tr class="fade-in-up" style="animation-delay: ${index * 0.03}s;">
      <td class="text-xs neon-text-cyan" style="font-weight: 600;">${String(index).padStart(3, '0')}</td>
      <td class="text-sm" style="font-weight: 500;">${factura.cliente_nombre}</td>
      <td class="text-xs text-muted">${factura.mesa || '—'}</td>
      <td class="text-sm">${formatCurrency(factura.subtotal)}</td>
      <td class="text-sm">${formatCurrency(factura.iva_monto)}</td>
      <td class="text-sm neon-text-yellow" style="font-weight: 700;">${formatCurrency(factura.total)}</td>
      <td><span class="badge badge--cyan">${metodoLabel[factura.metodo_pago] || factura.metodo_pago}</span></td>
      <td><span class="badge ${estadoClass}">${factura.estado}</span></td>
      <td class="text-xs text-muted">${fecha}</td>
    </tr>
  `;
}

function renderLoading() {
  return `
    <div class="flex-center" style="padding: 3rem;">
      <div class="loading-spinner"></div>
    </div>
  `;
}

function renderEmptyRow() {
  return `
    <tr>
      <td colspan="9" style="padding: 3rem; text-align: center;">
        <div class="empty-state">
          <div class="empty-state__icon" style="font-size: 2.5rem;">&#128196;</div>
          <p class="empty-state__text">No hay facturas registradas</p>
          <p class="text-xs text-muted mt-sm">Las facturas aparecerán aquí cuando se generen pedidos</p>
        </div>
      </td>
    </tr>
  `;
}

function renderError() {
  return `
    <div class="empty-state" style="padding: 3rem;">
      <div class="empty-state__icon text-red" style="font-size: 2.5rem;">&#9888;</div>
      <p class="empty-state__text text-red">Error cargando facturas</p>
      <button class="btn btn--ghost btn--sm mt-md" onclick="location.reload()">Reintentar</button>
    </div>
  `;
}
