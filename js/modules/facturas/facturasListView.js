/* =============================================
   facturasListView.js - Vista de Facturas (usuario autenticado)
   Lista historial de facturas y permite ver detalles
   de cada una en un modal.
   ============================================= */

import { FacturasService, PedidosService } from '../../services/dataAdapter.js';
import { AuthService } from '../../services/dataAdapter.js';
import { formatCurrency, showToast, openModal, closeModal, $ } from '../../utils/helpers.js';
import { formatFechaFactura } from '../pedidos/pedidoLogic.js';

let cachedFacturas = [];
let allFacturasEnriquecidas = [];

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  initFacturasGate();
});

function initFacturasGate() {
  const gate = $('facturasGate');
  const unauthorized = $('facturasUnauthorized');
  const navFacturasLink = $('navFacturasLink');
  const navAuthBtn = $('navAuthBtn');
  const navAdminLink = $('navAdminLink');

  if (!AuthService.isAuthenticated()) {
    if (gate) gate.style.display = 'none';
    if (unauthorized) unauthorized.style.display = 'flex';
    if (navFacturasLink) navFacturasLink.classList.remove('visible');
    if (navAdminLink) navAdminLink.classList.remove('visible');
    return;
  }

  if (gate) gate.style.display = '';
  if (unauthorized) unauthorized.style.display = 'none';
  if (navFacturasLink) navFacturasLink.classList.add('visible');
  if (navAdminLink) navAdminLink.classList.add('visible');
  if (navAuthBtn) {
    navAuthBtn.textContent = 'Cerrar Sesión';
    navAuthBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await AuthService.logout();
      window.location.href = '../pages/login.html';
    });
  }

  loadFacturas();
}

// ============================================
// CARGA DE DATOS
// ============================================

async function loadFacturas() {
  const container = $('facturasContainer');
  if (!container) return;

  try {
    container.innerHTML = renderLoading();
    const facturas = await FacturasService.getAll();
    cachedFacturas = facturas;
    allFacturasEnriquecidas = await enrichFacturas(facturas);
    renderStats(allFacturasEnriquecidas);
    renderTabla(allFacturasEnriquecidas);
    bindEvents();
  } catch (err) {
    console.error('[FacturasListView] Error:', err);
    container.innerHTML = renderError();
  }
}

async function enrichFacturas(facturas) {
  return Promise.all(
    facturas.map(async (f) => {
      try {
        const pedido = await PedidosService.getById(f.pedido_id);
        return {
          ...f,
          cliente_nombre: pedido?.cliente_nombre || 'N/A',
          mesa: pedido?.mesa || '',
          notas: pedido?.notas || null,
          items: pedido?.items || [],
        };
      } catch {
        return { ...f, cliente_nombre: 'N/A', mesa: '', notas: null, items: [] };
      }
    })
  );
}

// ============================================
// RENDER STATS
// ============================================

function renderStats(facturas) {
  const statsEl = $('facturasStats');
  if (!statsEl) return;

  const totalVentas = facturas.reduce((sum, f) => sum + (f.total || 0), 0);
  const totalIva = facturas.reduce((sum, f) => sum + (f.iva_monto || 0), 0);
  const totalFacturas = facturas.length;

  statsEl.innerHTML = `
    <div class="stats-grid mb-lg fade-in-up">
      <div class="stat-card">
        <div class="stat-card__label">Total Facturas</div>
        <div class="stat-card__value">${totalFacturas}</div>
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
  `;
}

// ============================================
// RENDER TABLA
// ============================================

function renderTabla(facturas) {
  const container = $('facturasContainer');
  if (!container) return;

  container.innerHTML = `
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${facturas.length === 0
            ? renderEmptyRow()
            : facturas.map((f, idx) => renderFacturaRow(f, idx + 1)).join('')}
        </tbody>
      </table>
    </div>
  `;

  bindRowEvents();
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
      <td>
        <button class="btn btn--ghost btn--sm view-factura-btn" data-id="${factura.id}">Ver Detalles</button>
      </td>
    </tr>
  `;
}

function renderEmptyRow() {
  return `
    <tr>
      <td colspan="10" style="padding: 3rem; text-align: center;">
        <div class="empty-state">
          <div class="empty-state__icon" style="font-size: 2.5rem;">&#128196;</div>
          <p class="empty-state__text">No hay facturas registradas</p>
          <p class="text-xs text-muted mt-sm">Las facturas aparecerán aquí cuando se generen pedidos</p>
        </div>
      </td>
    </tr>
  `;
}

function renderLoading() {
  return `
    <div class="flex-center" style="padding: 3rem;">
      <div class="loading-spinner"></div>
      <span class="text-muted text-sm" style="margin-left: 1rem;">Cargando facturas...</span>
    </div>
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

// ============================================
// EVENTOS
// ============================================

function bindEvents() {
  $('refreshFacturasBtn')?.addEventListener('click', loadFacturas);

  $('facturasSearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderTabla(allFacturasEnriquecidas);
      return;
    }
    const filtered = allFacturasEnriquecidas.filter(
      (f) =>
        f.cliente_nombre.toLowerCase().includes(query) ||
        (f.mesa && f.mesa.toLowerCase().includes(query))
    );
    renderTabla(filtered);
  });
}

function bindRowEvents() {
  document.querySelectorAll('.view-factura-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const factura = allFacturasEnriquecidas.find((f) => f.id === btn.dataset.id);
      if (factura) openFacturaDetail(factura);
    });
  });
}

// ============================================
// MODAL DETALLE DE FACTURA
// ============================================

function openFacturaDetail(factura) {
  const itemsHtml = (factura.items || [])
    .map(
      (item) => `
      <div class="factura-preview__line">
        <span>${item.nombre || 'Producto'} x${item.cantidad}</span>
        <span>${formatCurrency(item.cantidad * item.precio_unitario)}</span>
      </div>
    `
    )
    .join('');

  const itemsSection = factura.items && factura.items.length > 0
    ? `<div class="factura-preview__lines">${itemsHtml}</div>`
    : '<p class="text-muted text-sm" style="text-align:center; padding: 1rem 0;">Detalles no disponibles</p>';

  const metodoLabel = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'Tarjeta de Crédito',
    tarjeta_debito: 'Tarjeta de Débito',
    transferencia: 'Transferencia',
  };

  const body = `
    <div class="factura-preview">
      <div class="factura-preview__header">
        <h4 class="neon-text-cyan" style="letter-spacing:2px;">RESTOAPP</h4>
        <p class="text-muted text-xs">Factura de Venta</p>
        <p class="text-xs mt-sm">Fecha: <span class="text-secondary">${formatFechaFactura(factura.created_at)}</span></p>
        <p class="text-xs">Cliente: <span class="text-secondary">${factura.cliente_nombre}</span></p>
        <p class="text-xs">Mesa: <span class="text-secondary">${factura.mesa || 'N/A'}</span></p>
        ${factura.notas ? `<p class="text-xs">Notas: <span class="text-muted">${factura.notas}</span></p>` : ''}
        <p class="text-xs">Pago: <span class="text-secondary">${metodoLabel[factura.metodo_pago] || factura.metodo_pago}</span></p>
      </div>
      ${itemsSection}
      <div class="factura-preview__totals">
        <div class="factura-preview__total-row">
          <span class="text-secondary">Subtotal</span>
          <span>${formatCurrency(factura.subtotal)}</span>
        </div>
        <div class="factura-preview__total-row">
          <span class="text-secondary">IVA (${factura.iva_porcentaje}%)</span>
          <span>${formatCurrency(factura.iva_monto)}</span>
        </div>
        <div class="factura-preview__total-row factura-preview__total-row--final">
          <span>TOTAL</span>
          <span>${formatCurrency(factura.total)}</span>
        </div>
      </div>
    </div>
  `;

  openModal(
    `Factura #${allFacturasEnriquecidas.indexOf(factura) + 1}`,
    body,
    '<button class="btn btn--primary" id="closeFacturaDetailBtn">Cerrar</button>'
  );

  setTimeout(() => {
    $('closeFacturaDetailBtn')?.addEventListener('click', closeModal);
  }, 50);
}
