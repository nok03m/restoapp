/* =============================================
   pedidoView.js - Renderizado del módulo Pedidos
   Gestiona la UI de creación de pedidos.
   ============================================= */

import { ProductosService, PedidosService, FacturasService } from '../../services/dataAdapter.js';
import { formatCurrency, showToast, openModal, closeModal, $ } from '../../utils/helpers.js';
import {
  calcularTotalesPedido,
  validarPedido,
  formatFechaFactura,
} from './pedidoLogic.js';

// Estado local del pedido en construcción
let currentPedido = {
  cliente_nombre: '',
  mesa: '',
  notas: '',
  items: [],
};

// Cache de productos del menú
let menuProductos = [];
let menuFilter = 'todos';

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', async () => {
  await initPedidoModule();
});

async function initPedidoModule() {
  const container = $('pedidoContainer');
  if (!container) return;

  try {
    menuProductos = await ProductosService.getAll({ disponible: true });
    renderPedidoForm(container);
  } catch (err) {
    container.innerHTML = renderErrorState('Error cargando el menú');
  }
}

// ============================================
// RENDER PRINCIPAL
// ============================================

function renderPedidoForm(container) {
  const categorias = ['todos', ...new Set(menuProductos.map((p) => p.categoria))];

  container.innerHTML = `
    <div class="grid grid-2" style="gap: 2rem; align-items: start;">

      <!-- Panel izquierdo: selección de productos -->
      <div>
        <div class="flex-between mb-md">
          <h3 class="card__title neon-text-cyan">Menú Disponible</h3>
          <span class="text-xs text-muted" id="pedidoMenuCount">${menuProductos.length} productos</span>
        </div>

        <!-- Búsqueda -->
        <div class="form-group" style="margin-bottom: 1rem;">
          <input type="text" id="pedidoSearch" class="form-input" placeholder="Buscar producto...">
        </div>

        <!-- Filtros de categoría -->
        <div class="flex gap-sm mb-lg flex-wrap" id="pedidoCategorias">
          ${categorias
            .map(
              (cat) => `
            <button class="btn btn--ghost btn--sm pedido-cat-btn ${cat === 'todos' ? 'pedido-cat-btn--active' : ''}" data-cat="${cat}">
              ${cat === 'todos' ? 'Todos' : cat}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Grid de productos -->
        <div class="grid grid-auto-fill" id="pedidoMenuGrid" style="gap: 1rem;">
          ${renderMenuItems(menuProductos)}
        </div>
      </div>

      <!-- Panel derecho: resumen del pedido -->
      <div>
        <div class="card" id="pedidoResumenCard" style="position: sticky; top: 90px;">
          <h3 class="card__title neon-text-magenta mb-md">Resumen del Pedido</h3>

          <div class="form-group">
            <label class="form-label" for="pedidoCliente">Nombre del cliente *</label>
            <input type="text" id="pedidoCliente" class="form-input" placeholder="Ej: Juan Pérez" maxlength="100">
          </div>

          <div class="form-group">
            <label class="form-label" for="pedidoMesa">Mesa</label>
            <input type="text" id="pedidoMesa" class="form-input" placeholder="Ej: Mesa 5" maxlength="20">
          </div>

          <div class="form-group">
            <label class="form-label" for="pedidoNotas">Notas especiales</label>
            <input type="text" id="pedidoNotas" class="form-input" placeholder="Sin cebolla, poco hecho..." maxlength="200">
          </div>

          <div class="cyber-divider"></div>

          <!-- Lista de items agregados -->
          <div id="pedidoItemsList">
            ${renderEmptyItems()}
          </div>

          <!-- Totales -->
          <div id="pedidoTotales" style="display: none;">
            <div class="cyber-divider"></div>
            <div class="flex-between mb-sm">
              <span class="text-secondary text-sm">Subtotal:</span>
              <span class="text-sm" id="pedidoSubtotal">$0</span>
            </div>
            <div class="flex-between mb-sm">
              <span class="text-secondary text-sm">IVA (19%):</span>
              <span class="text-sm" id="pedidoIva">$0</span>
            </div>
            <div class="flex-between mb-sm">
              <span class="text-secondary text-sm">Ítems:</span>
              <span class="text-sm text-muted" id="pedidoItemCount">0</span>
            </div>
            <div class="cyber-divider" style="margin: 0.75rem 0;"></div>
            <div class="flex-between">
              <span class="text-secondary" style="font-weight:700;">TOTAL:</span>
              <span class="neon-text-yellow" style="font-weight:700; font-size:1.2rem;" id="pedidoTotal">$0</span>
            </div>
          </div>

          <div class="cyber-divider"></div>

          <button class="btn btn--primary btn--block btn--lg" id="pedidoGenerarBtn" disabled>
            Generar Factura
          </button>
        </div>
      </div>
    </div>
  `;

  bindPedidoEvents();
}

// ============================================
// RENDER DE PRODUCTOS
// ============================================

function renderMenuItems(productos) {
  if (productos.length === 0) {
    return renderEmptyMenu();
  }

  return productos
    .map(
      (p, idx) => `
      <div class="card card--product pedido-product-card fade-in-up" data-product-id="${p.id}" style="animation-delay: ${idx * 0.04}s; padding: 1.25rem;">
        <span class="card__category">${p.categoria}</span>
        <h4 class="card__title mt-sm" style="font-size: 0.95rem; line-height: 1.3;">${p.nombre}</h4>
        <p class="card__body text-xs" style="margin: 0.5rem 0; line-height: 1.5; min-height: 2rem;">${p.descripcion || 'Sin descripción'}</p>
        <span class="card__price">${formatCurrency(p.precio)}</span>
        <button class="btn btn--primary btn--sm btn--block add-to-pedido-btn" data-id="${p.id}" style="margin-top: 0.75rem;">
          + Agregar al pedido
        </button>
      </div>
    `
    )
    .join('');
}

function renderEmptyMenu() {
  return `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-state__icon">&#128269;</div>
      <p class="empty-state__text">No se encontraron productos</p>
    </div>
  `;
}

function renderEmptyItems() {
  return `
    <div class="empty-state" style="padding: 1.5rem;">
      <div class="empty-state__icon" style="font-size: 2rem;">&#128722;</div>
      <p class="empty-state__text">Agrega productos desde el menú...</p>
    </div>
  `;
}

function renderErrorState(message) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon text-red">&#9888;</div>
      <p class="empty-state__text text-red">${message}</p>
    </div>
  `;
}

// ============================================
// EVENTOS
// ============================================

function bindPedidoEvents() {
  // Botones "Agregar"
  document.querySelectorAll('.add-to-pedido-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      addItemToPedido(btn.dataset.id);
    });
  });

  // Búsqueda
  const searchInput = $('pedidoSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Filtros de categoría
  const catBtns = document.querySelectorAll('.pedido-cat-btn');
  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      catBtns.forEach((b) => b.classList.remove('pedido-cat-btn--active'));
      btn.classList.add('pedido-cat-btn--active');
      menuFilter = btn.dataset.cat;
      applyFilters();
    });
  });

  // Botón "Generar Factura"
  const generarBtn = $('pedidoGenerarBtn');
  if (generarBtn) {
    generarBtn.addEventListener('click', handleGenerarFactura);
  }
}

function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const query = ($('pedidoSearch')?.value || '').toLowerCase().trim();
  let filtered = menuProductos;

  if (menuFilter !== 'todos') {
    filtered = filtered.filter((p) => p.categoria === menuFilter);
  }

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query)) ||
        p.categoria.toLowerCase().includes(query)
    );
  }

  const grid = $('pedidoMenuGrid');
  if (grid) {
    grid.innerHTML = renderMenuItems(filtered);
    rebindAddButtons();
  }

  const count = $('pedidoMenuCount');
  if (count) {
    count.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;
  }
}

function rebindAddButtons() {
  document.querySelectorAll('.add-to-pedido-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      addItemToPedido(btn.dataset.id);
    });
  });
}

// ============================================
// CRUD DE LÍNEAS DEL PEDIDO
// ============================================

function addItemToPedido(productId) {
  const product = menuProductos.find((p) => p.id === productId);
  if (!product) return;

  const existing = currentPedido.items.find((i) => i.producto_id === productId);
  if (existing) {
    if (existing.cantidad >= 99) {
      showToast('Cantidad máxima alcanzada (99)', 'error');
      return;
    }
    existing.cantidad += 1;
  } else {
    currentPedido.items.push({
      producto_id: product.id,
      nombre: product.nombre,
      cantidad: 1,
      precio_unitario: product.precio,
    });
  }

  updatePedidoUI();
  showToast(`${product.nombre} agregado`, 'success', 1200);
}

function removeItemFromPedido(index) {
  const item = currentPedido.items[index];
  if (item) {
    currentPedido.items.splice(index, 1);
    updatePedidoUI();
  }
}

function changeItemQuantity(index, delta) {
  const item = currentPedido.items[index];
  if (!item) return;

  item.cantidad += delta;

  if (item.cantidad <= 0) {
    currentPedido.items.splice(index, 1);
  } else if (item.cantidad > 99) {
    item.cantidad = 99;
  }

  updatePedidoUI();
}

// ============================================
// ACTUALIZACIÓN DE UI
// ============================================

function updatePedidoUI() {
  const itemsList = $('pedidoItemsList');
  const totalesDiv = $('pedidoTotales');
  const generarBtn = $('pedidoGenerarBtn');

  if (currentPedido.items.length === 0) {
    itemsList.innerHTML = renderEmptyItems();
    totalesDiv.style.display = 'none';
    generarBtn.disabled = true;
    return;
  }

  generarBtn.disabled = false;
  totalesDiv.style.display = '';

  itemsList.innerHTML = currentPedido.items
    .map(
      (item, idx) => `
      <div class="flex-between pedido-item-row" style="padding: 0.6rem 0; border-bottom: 1px solid var(--border-dim);">
        <div style="flex: 1; min-width: 0;">
          <span class="text-sm" style="color: var(--text-heading); font-weight: 600;">${item.nombre}</span>
          <div class="flex gap-sm mt-sm" style="align-items:center;">
            <button class="btn btn--ghost btn--sm qty-btn" data-action="decrease" data-idx="${idx}" style="padding: 2px 10px; font-size: 0.8rem; border: 1px solid var(--border-dim); border-radius: var(--radius-sm);">-</button>
            <span class="text-xs neon-text-cyan" style="min-width: 1.5rem; text-align: center; font-weight: 700;">${item.cantidad}</span>
            <button class="btn btn--ghost btn--sm qty-btn" data-action="increase" data-idx="${idx}" style="padding: 2px 10px; font-size: 0.8rem; border: 1px solid var(--border-dim); border-radius: var(--radius-sm);">+</button>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0; margin-left: 1rem;">
          <span class="text-sm text-yellow" style="font-weight: 700;">${formatCurrency(item.cantidad * item.precio_unitario)}</span>
          <button class="btn btn--ghost btn--sm remove-item-btn" data-idx="${idx}" style="color: var(--neon-red); padding: 2px 6px; font-size: 0.7rem; margin-left: 0.25rem;" title="Eliminar">×</button>
        </div>
      </div>
    `
    )
    .join('');

  // Bind qty buttons
  document.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const action = btn.dataset.action;
      changeItemQuantity(idx, action === 'increase' ? 1 : -1);
    });
  });

  // Bind remove buttons
  document.querySelectorAll('.remove-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeItemFromPedido(parseInt(btn.dataset.idx));
    });
  });

  // Calcular y mostrar totales
  const totales = calcularTotalesPedido(currentPedido.items);
  $('pedidoSubtotal').textContent = formatCurrency(totales.subtotal);
  $('pedidoIva').textContent = formatCurrency(totales.iva);
  $('pedidoTotal').textContent = formatCurrency(totales.total);
  $('pedidoItemCount').textContent = `${totales.itemCount} unidad${totales.itemCount !== 1 ? 'es' : ''}`;
}

// ============================================
// GENERAR FACTURA
// ============================================

async function handleGenerarFactura() {
  currentPedido.cliente_nombre = ($('pedidoCliente')?.value || '').trim();
  currentPedido.mesa = ($('pedidoMesa')?.value || '').trim();
  currentPedido.notas = ($('pedidoNotas')?.value || '').trim();

  // Validar
  const validation = validarPedido(currentPedido);
  if (!validation.valid) {
    showToast(validation.errors[0], 'error');
    return;
  }

  // Confirmación antes de facturar
  const totales = calcularTotalesPedido(currentPedido.items);
  const confirmBody = `
    <div style="text-align: center;">
      <p class="text-secondary mb-md">¿Confirmar pedido para <strong class="text-heading">${currentPedido.cliente_nombre}</strong>?</p>
      <div class="cyber-divider" style="margin: 1rem 0;"></div>
      <div class="flex-between mb-sm">
        <span class="text-secondary text-sm">Ítems:</span>
        <span class="text-sm">${totales.itemCount} unidades</span>
      </div>
      <div class="flex-between mb-md">
        <span class="text-secondary" style="font-weight:700;">TOTAL:</span>
        <span class="neon-text-yellow" style="font-weight:700; font-size:1.3rem;">${formatCurrency(totales.total)}</span>
      </div>
    </div>
  `;

  const confirmFooter = `
    <button class="btn btn--ghost" id="confirmCancelBtn">Cancelar</button>
    <button class="btn btn--success" id="confirmAcceptBtn">Confirmar y Facturar</button>
  `;

  openModal('Confirmar Pedido', confirmBody, confirmFooter);

  setTimeout(() => {
    $('confirmCancelBtn')?.addEventListener('click', closeModal);
    $('confirmAcceptBtn')?.addEventListener('click', async () => {
      closeModal();
      await procesarFactura();
    });
  }, 50);
}

async function procesarFactura() {
  const generarBtn = $('pedidoGenerarBtn');
  generarBtn.disabled = true;
  generarBtn.textContent = 'Procesando...';

  try {
    let pedido;
    try {
      pedido = await PedidosService.create(currentPedido);
    } catch (pedidoErr) {
      console.error('[PedidoView] Error creando pedido:', pedidoErr);
      showToast('Error al crear el pedido: ' + (pedidoErr.message || 'Error desconocido'), 'error');
      return;
    }

    if (!pedido || !pedido.id) {
      console.error('[PedidoView] Pedido creado sin ID válido:', pedido);
      showToast('Error: el pedido no se guardó correctamente', 'error');
      return;
    }

    let factura;
    try {
      factura = await FacturasService.create(pedido.id, {
        metodo_pago: 'efectivo',
      });
    } catch (facturaErr) {
      console.error('[PedidoView] Error creando factura:', facturaErr);
      showToast('Pedido guardado, pero error al crear la factura: ' + (facturaErr.message || 'Error desconocido'), 'error');
      return;
    }

    if (!factura) {
      console.error('[PedidoView] Factura retornó null para pedido:', pedido.id);
      showToast('Error: la factura no se pudo generar', 'error');
      return;
    }

    showFacturaModal(pedido, factura);
    resetPedido();
    showToast('Factura generada exitosamente', 'success');
  } catch (err) {
    console.error('[PedidoView] Error inesperado en procesarFactura:', err);
    showToast('Error inesperado al procesar el pedido', 'error');
  } finally {
    generarBtn.disabled = false;
    generarBtn.textContent = 'Generar Factura';
  }
}

// ============================================
// MODAL DE FACTURA
// ============================================

function showFacturaModal(pedido, factura) {
  const itemsHtml = (pedido.items || [])
    .map(
      (item) => `
      <div class="factura-preview__line">
        <span>${item.nombre || 'Producto'} x${item.cantidad}</span>
        <span>${formatCurrency(item.cantidad * item.precio_unitario)}</span>
      </div>
    `
    )
    .join('');

  const body = `
    <div class="factura-preview">
      <div class="factura-preview__header">
        <h4 class="neon-text-cyan" style="letter-spacing:2px;">RESTOAPP</h4>
        <p class="text-muted text-xs">Factura de Venta</p>
        <p class="text-xs mt-sm">Fecha: <span class="text-secondary">${formatFechaFactura(factura.created_at)}</span></p>
        <p class="text-xs">Cliente: <span class="text-secondary">${pedido.cliente_nombre}</span></p>
        <p class="text-xs">Mesa: <span class="text-secondary">${pedido.mesa || 'N/A'}</span></p>
        ${pedido.notas ? `<p class="text-xs">Notas: <span class="text-muted">${pedido.notas}</span></p>` : ''}
      </div>
      <div class="factura-preview__lines">${itemsHtml}</div>
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
    'Factura Generada',
    body,
    '<button class="btn btn--primary" id="closeFacturaBtn">Cerrar</button>'
  );

  setTimeout(() => {
    $('closeFacturaBtn')?.addEventListener('click', closeModal);
  }, 50);
}

// ============================================
// RESET
// ============================================

function resetPedido() {
  currentPedido = { cliente_nombre: '', mesa: '', notas: '', items: [] };
  if ($('pedidoCliente')) $('pedidoCliente').value = '';
  if ($('pedidoMesa')) $('pedidoMesa').value = '';
  if ($('pedidoNotas')) $('pedidoNotas').value = '';
  updatePedidoUI();
}
