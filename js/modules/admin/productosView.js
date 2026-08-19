/* =============================================
   productosView.js - CRUD UI de Productos (Admin)
   ============================================= */

import { ProductosService } from '../../services/dataAdapter.js';
import { AuthService } from '../../services/dataAdapter.js';
import { formatCurrency, showToast, openModal, closeModal, $ } from '../../utils/helpers.js';

let allProductos = [];

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.isAuthenticated()) return;

  const container = $('adminProductosContainer');
  if (!container) return;

  await loadProductos(container);
});

/**
 * Carga y renderiza la tabla de productos.
 */
async function loadProductos(container) {
  try {
    allProductos = await ProductosService.getAll();
    renderProductosTable(container);
  } catch (err) {
    container.innerHTML = `<p class="text-red">Error cargando productos.</p>`;
  }
}

function renderProductosTable(container) {
  const categorias = [...new Set(allProductos.map((p) => p.categoria))];

  container.innerHTML = `
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <div class="admin-toolbar__search">
        <input type="text" class="form-input" id="productosSearch" placeholder="Buscar producto..." style="width: 250px;">
      </div>
      <button class="btn btn--primary" id="addProductoBtn">+ Nuevo Producto</button>
    </div>

    <!-- Filtros -->
    <div class="table-filters mb-md">
      <button class="btn btn--ghost btn--sm btn--filter active" data-filter="all">Todos</button>
      ${categorias.map((c) => `<button class="btn btn--ghost btn--sm btn--filter" data-filter="${c}">${c}</button>`).join('')}
    </div>

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="table admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="productosTableBody">
          ${renderProductosRows(allProductos)}
        </tbody>
      </table>
    </div>
  `;

  bindProductosEvents(container);
}

function renderProductosRows(productos) {
  if (productos.length === 0) {
    return '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No hay productos para mostrar.</td></tr>';
  }

  return productos
    .map(
      (p) => `
    <tr data-id="${p.id}">
      <td>
        <div>
          <span class="text-sm" style="color: var(--text-heading); font-weight: 600;">${p.nombre}</span>
          <div class="text-xs text-muted mt-sm">${p.descripcion || 'Sin descripción'}</div>
        </div>
      </td>
      <td><span class="badge badge--magenta">${p.categoria}</span></td>
      <td class="neon-text-yellow text-sm" style="font-weight: 700;">${formatCurrency(p.precio)}</td>
      <td>
        <span class="badge ${p.disponible ? 'badge--green' : 'badge--red'}">
          ${p.disponible ? 'Disponible' : 'Agotado'}
        </span>
      </td>
      <td>
        <div class="flex gap-sm">
          <button class="btn btn--ghost btn--sm edit-producto-btn" data-id="${p.id}">Editar</button>
          <button class="btn btn--ghost btn--sm delete-producto-btn" data-id="${p.id}" style="color: var(--neon-red);">Eliminar</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

function bindProductosEvents(container) {
  // Nuevo producto
  $('addProductoBtn')?.addEventListener('click', () => openProductoModal());

  // Búsqueda
  $('productosSearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allProductos.filter(
      (p) => p.nombre.toLowerCase().includes(query) || p.categoria.toLowerCase().includes(query)
    );
    $('productosTableBody').innerHTML = renderProductosRows(filtered);
    rebindRowEvents(container);
  });

  // Filtros
  container.querySelectorAll('.btn--filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn--filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const filtered = filter === 'all' ? allProductos : allProductos.filter((p) => p.categoria === filter);
      $('productosTableBody').innerHTML = renderProductosRows(filtered);
      rebindRowEvents(container);
    });
  });

  rebindRowEvents(container);
}

function rebindRowEvents(container) {
  container.querySelectorAll('.edit-producto-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const producto = allProductos.find((p) => p.id === btn.dataset.id);
      if (producto) openProductoModal(producto);
    });
  });

  container.querySelectorAll('.delete-producto-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteProducto(btn.dataset.id));
  });
}

/**
 * Abre modal para crear/editar producto.
 */
function openProductoModal(producto = null) {
  const isEdit = producto !== null;
  const title = isEdit ? 'Editar Producto' : 'Nuevo Producto';

  const body = `
    <form id="productoForm">
      <div class="form-group">
        <label class="form-label" for="prodNombre">Nombre</label>
        <input type="text" id="prodNombre" class="form-input" value="${isEdit ? producto.nombre : ''}" required placeholder="Nombre del producto">
      </div>
      <div class="form-group">
        <label class="form-label" for="prodDescripcion">Descripción</label>
        <input type="text" id="prodDescripcion" class="form-input" value="${isEdit ? producto.descripcion || '' : ''}" placeholder="Descripción breve">
      </div>
      <div class="form-group">
        <label class="form-label" for="prodPrecio">Precio ($)</label>
        <input type="number" id="prodPrecio" class="form-input" value="${isEdit ? producto.precio : ''}" min="1" required placeholder="Ej: 12900">
      </div>
      <div class="form-group">
        <label class="form-label" for="prodCategoria">Categoría</label>
        <select id="prodCategoria" class="form-select">
          <option value="burgers" ${isEdit && producto.categoria === 'burgers' ? 'selected' : ''}>Burgers</option>
          <option value="pizzas" ${isEdit && producto.categoria === 'pizzas' ? 'selected' : ''}>Pizzas</option>
          <option value="acompañamientos" ${isEdit && producto.categoria === 'acompañamientos' ? 'selected' : ''}>Acompañamientos</option>
          <option value="bebidas" ${isEdit && producto.categoria === 'bebidas' ? 'selected' : ''}>Bebidas</option>
          <option value="postres" ${isEdit && producto.categoria === 'postres' ? 'selected' : ''}>Postres</option>
          <option value="general" ${isEdit && producto.categoria === 'general' ? 'selected' : ''}>General</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="prodDisponible">Estado</label>
        <select id="prodDisponible" class="form-select">
          <option value="true" ${isEdit && producto.disponible ? 'selected' : ''}>Disponible</option>
          <option value="false" ${isEdit && !producto.disponible ? 'selected' : ''}>Agotado</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn--ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn--primary" id="saveProductoBtn">${isEdit ? 'Guardar Cambios' : 'Crear Producto'}</button>
  `;

  openModal(title, body, footer);

  setTimeout(() => {
    $('saveProductoBtn')?.addEventListener('click', async () => {
      await handleSaveProducto(isEdit ? producto.id : null);
    });
  }, 50);
}

async function handleSaveProducto(id) {
  const data = {
    nombre: $('prodNombre').value.trim(),
    descripcion: $('prodDescripcion').value.trim(),
    precio: Number($('prodPrecio').value),
    categoria: $('prodCategoria').value,
    disponible: $('prodDisponible').value === 'true',
  };

  if (!data.nombre || !data.precio || data.precio <= 0) {
    showToast('Nombre y precio son requeridos', 'error');
    return;
  }

  try {
    if (id) {
      await ProductosService.update(id, data);
      showToast('Producto actualizado', 'success');
    } else {
      await ProductosService.create(data);
      showToast('Producto creado', 'success');
    }
    closeModal();
    const container = $('adminProductosContainer');
    await loadProductos(container);
  } catch (err) {
    showToast('Error al guardar producto', 'error');
  }
}

async function handleDeleteProducto(id) {
  const producto = allProductos.find((p) => p.id === id);
  if (!producto) return;

  const body = `
    <p class="text-secondary">¿Estás seguro de eliminar <strong class="text-heading">${producto.nombre}</strong>?</p>
    <p class="text-muted text-xs mt-sm">Esta acción no se puede deshacer.</p>
  `;

  const footer = `
    <button class="btn btn--ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn--danger" id="confirmDeleteBtn">Eliminar</button>
  `;

  openModal('Confirmar Eliminación', body, footer);

  setTimeout(() => {
    $('confirmDeleteBtn')?.addEventListener('click', async () => {
      const success = await ProductosService.delete(id);
      if (success) {
        showToast('Producto eliminado', 'success');
        closeModal();
        const container = $('adminProductosContainer');
        await loadProductos(container);
      } else {
        showToast('Error al eliminar', 'error');
      }
    });
  }, 50);
}

// Exponer closeModal globalmente para onclick del modal
window.closeModal = closeModal;
