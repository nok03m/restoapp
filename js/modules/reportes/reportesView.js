/* =============================================
   reportesView.js - Vista de Reportes Analíticos
   Gráficos, rankings, KPIs y datos consolidados.
   Tema Cyberpunk Neon con animaciones avanzadas.
   ============================================= */

import { FacturasService, PedidosService, ProductosService } from '../../services/dataAdapter.js';
import { AuthService } from '../../services/dataAdapter.js';
import { formatCurrency, showToast, $ } from '../../utils/helpers.js';
import { formatFechaFactura } from '../pedidos/pedidoLogic.js';

const NEON_COLORS = ['#00FFFF', '#6600CC', '#00FF00', '#00FFFF', '#6600CC', '#00FF00'];
const BAR_CLASSES = ['cyan', 'magenta', 'yellow', 'green', 'orange'];

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  if ($('reportesGate')) initReportesGate();
});

function initReportesGate() {
  const gate = $('reportesGate');
  const unauthorized = $('reportesUnauthorized');
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

  loadReportes();
}

// ============================================
// CARGA Y ORQUESTACIÓN DE DATOS
// ============================================

async function loadReportes() {
  try {
    const [facturas, pedidos, productos] = await Promise.all([
      FacturasService.getAll(),
      PedidosService.getAll(),
      ProductosService.getAll(),
    ]);

    const facturasEnriquecidas = await enrichFacturasWithPedido(facturas);
    const detalles = await loadAllDetalles(pedidos, productos);

    const analytics = computeAnalytics(facturas, facturasEnriquecidas, pedidos, productos, detalles);

    renderKpis(analytics);
    renderTopProducts(analytics.topProducts);
    renderPaymentDonut(analytics.paymentMethods);
    renderTopClients(analytics.topClients);
    renderCategoryBars(analytics.categorySales);
    renderTrendChart(analytics.dailySales);
    renderRecentOrders(analytics.recentOrders);

  } catch (err) {
    console.error('[ReportesView] Error:', err);
    showToast('Error cargando reportes', 'error');
  }
}

async function enrichFacturasWithPedido(facturas) {
  return Promise.all(
    facturas.map(async (f) => {
      try {
        const pedido = await PedidosService.getById(f.pedido_id);
        return { ...f, cliente_nombre: pedido?.cliente_nombre || 'N/A', mesa: pedido?.mesa || '' };
      } catch {
        return { ...f, cliente_nombre: 'N/A', mesa: '' };
      }
    })
  );
}

async function loadAllDetalles(pedidos, productos) {
  const allDetalles = [];
  const productoMap = {};
  productos.forEach((p) => { productoMap[p.id] = p; });

  for (const p of pedidos) {
    try {
      const fullPedido = await PedidosService.getById(p.id);
      if (fullPedido && fullPedido.items && fullPedido.items.length > 0) {
        fullPedido.items.forEach((item) => {
          const producto = productoMap[item.producto_id];
          allDetalles.push({
            ...item,
            nombre: producto?.nombre || item.nombre || 'Producto',
            categoria: producto?.categoria || 'general',
            pedido_id: fullPedido.id,
            cliente_nombre: fullPedido.cliente_nombre,
            created_at: fullPedido.created_at,
          });
        });
      }
    } catch {
      // skip
    }
  }
  return allDetalles;
}

// ============================================
// CÁLCULOS ANALÍTICOS
// ============================================

function computeAnalytics(facturas, facturasEnriquecidas, pedidos, productos, detalles) {
  const totalRevenue = facturas.reduce((s, f) => s + (f.total || 0), 0);
  const totalOrders = pedidos.length;
  const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Producto más vendido (nombre ya viene enriquecido en el detalle)
  const productSalesMap = {};
  detalles.forEach((d) => {
    const nombre = d.nombre || 'Producto';
    if (!productSalesMap[nombre]) productSalesMap[nombre] = { nombre, cantidad: 0, revenue: 0 };
    productSalesMap[nombre].cantidad += d.cantidad || 0;
    productSalesMap[nombre].revenue += (d.cantidad || 0) * (d.precio_unitario || 0);
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 8);
  const totalIva = facturas.reduce((s, f) => s + (f.iva_monto || 0), 0);

  // Métodos de pago
  const paymentMap = {};
  facturas.forEach((f) => {
    const m = f.metodo_pago || 'efectivo';
    paymentMap[m] = (paymentMap[m] || 0) + 1;
  });
  const totalFacturasCount = facturas.length || 1;
  const paymentMethods = Object.entries(paymentMap)
    .map(([key, count]) => ({
      key,
      label: paymentLabel(key),
      count,
      pct: Math.round((count / totalFacturasCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Clientes más activos
  const clientMap = {};
  facturasEnriquecidas.forEach((f) => {
    const name = f.cliente_nombre || 'N/A';
    if (!clientMap[name]) clientMap[name] = { nombre: name, pedidos: 0, total: 0 };
    clientMap[name].pedidos += 1;
    clientMap[name].total += f.total || 0;
  });
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Ventas por categoría (categoría ya viene enriquecida en el detalle)
  const catMap = {};
  detalles.forEach((d) => {
    const cat = d.categoria || 'general';
    if (!catMap[cat]) catMap[cat] = { categoria: cat, cantidad: 0, revenue: 0 };
    catMap[cat].cantidad += d.cantidad || 0;
    catMap[cat].revenue += (d.cantidad || 0) * (d.precio_unitario || 0);
  });
  const categorySales = Object.values(catMap)
    .sort((a, b) => b.revenue - a.revenue);

  // Tendencia diaria (últimos 30 días)
  const dailySales = computeDailySales(facturas, 30);

  // Últimos pedidos (solo completados, que son los que tienen factura)
  const recentOrders = pedidos
    .filter((p) => p.estado === 'completado')
    .slice(0, 8);

  return {
    totalRevenue,
    totalOrders,
    avgTicket,
    totalIva,
    topProducts,
    paymentMethods,
    topClients,
    categorySales,
    dailySales,
    recentOrders,
  };
}

function computeDailySales(facturas, days) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, label: `${d.getDate()}/${d.getMonth() + 1}`, total: 0 });
  }

  facturas.forEach((f) => {
    const fecha = f.created_at ? f.created_at.slice(0, 10) : null;
    if (!fecha) return;
    const entry = result.find((r) => r.date === fecha);
    if (entry) entry.total += f.total || 0;
  });

  return result;
}

function paymentLabel(key) {
  const map = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'T. Crédito',
    tarjeta_debito: 'T. Débito',
    transferencia: 'Transferencia',
  };
  return map[key] || key;
}

// ============================================
// RENDER: KPI CARDS
// ============================================

function renderKpis(analytics) {
  const container = $('reportesKpiRow');
  if (!container) return;

  container.innerHTML = `
    <div class="reportes-kpi fade-in-up stagger-1">
      <span class="reportes-kpi__icon">&#128176;</span>
      <div class="reportes-kpi__label">Ingresos Totales</div>
      <div class="reportes-kpi__value reportes-kpi__value--cyan" data-count="${analytics.totalRevenue}">${formatCurrency(analytics.totalRevenue)}</div>
      <div class="reportes-kpi__change">Facturas pagadas</div>
    </div>
    <div class="reportes-kpi fade-in-up stagger-2">
      <span class="reportes-kpi__icon">&#128230;</span>
      <div class="reportes-kpi__label">Total Pedidos</div>
      <div class="reportes-kpi__value reportes-kpi__value--magenta" data-count="${analytics.totalOrders}">${analytics.totalOrders}</div>
      <div class="reportes-kpi__change">Registrados en el sistema</div>
    </div>
    <div class="reportes-kpi fade-in-up stagger-3">
      <span class="reportes-kpi__icon">&#128179;</span>
      <div class="reportes-kpi__label">Ticket Promedio</div>
      <div class="reportes-kpi__value reportes-kpi__value--yellow" data-count="${analytics.avgTicket}">${formatCurrency(analytics.avgTicket)}</div>
      <div class="reportes-kpi__change">Por pedido</div>
    </div>
    <div class="reportes-kpi fade-in-up stagger-4">
      <span class="reportes-kpi__icon">&#128196;</span>
      <div class="reportes-kpi__label">IVA Recaudado</div>
      <div class="reportes-kpi__value reportes-kpi__value--green" data-count="${analytics.totalIva}">${formatCurrency(analytics.totalIva)}</div>
      <div class="reportes-kpi__change">19% sobre ventas</div>
    </div>
  `;

  animateCounters(container);
}

function animateCounters(container) {
  container.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || target === 0) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      if (el.dataset.count && el.textContent.includes('$')) {
        el.textContent = formatCurrency(current);
      } else {
        el.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

// ============================================
// RENDER: TOP PRODUCTS (CSS BAR CHART)
// ============================================

function renderTopProducts(products) {
  const container = $('reportesTopProducts');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = renderEmpty('No hay datos de productos');
    return;
  }

  const max = Math.max(...products.map((p) => p.cantidad));

  container.innerHTML = `
    <div class="reportes-bars" id="reportesBarsAnim">
      ${products.map((p, i) => {
        const pct = max > 0 ? (p.cantidad / max) * 100 : 0;
        const colorClass = BAR_CLASSES[i % BAR_CLASSES.length];
        return `
          <div class="reportes-bar">
            <div class="reportes-bar__value">${p.cantidad}</div>
            <div class="reportes-bar__fill reportes-bar__fill--${colorClass}" style="height: 0%;" data-height="${pct}"></div>
            <div class="reportes-bar__label">${p.nombre}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  setTimeout(() => animateBars(container), 200);
}

function animateBars(container) {
  container.querySelectorAll('.reportes-bar__fill').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.height = bar.dataset.height + '%';
      bar.closest('.reportes-bar')?.classList.add('reportes-bar--visible');
    }, i * 80);
  });
}

// ============================================
// RENDER: PAYMENT DONUT (conic-gradient)
// ============================================

function renderPaymentDonut(methods) {
  const container = $('reportesPaymentDonut');
  if (!container) return;

  if (methods.length === 0) {
    container.innerHTML = renderEmpty('No hay datos de pagos');
    return;
  }

  let gradientParts = [];
  let accumulated = 0;

  methods.forEach((m, i) => {
    const color = NEON_COLORS[i % NEON_COLORS.length];
    const start = accumulated;
    accumulated += m.pct;
    gradientParts.push(`${color} ${start}% ${accumulated}%`);
  });

  const totalPagos = methods.reduce((s, m) => s + m.count, 0);

  container.innerHTML = `
    <div class="reportes-donut-wrap">
      <div class="reportes-donut" style="background: conic-gradient(${gradientParts.join(', ')})">
        <div class="reportes-donut__center">
          <div class="reportes-donut__center-value">${totalPagos}</div>
          <div class="reportes-donut__center-label">Pagos</div>
        </div>
      </div>
      <div class="reportes-donut-legend">
        ${methods.map((m, i) => {
          const color = NEON_COLORS[i % NEON_COLORS.length];
          return `
            <div class="reportes-donut-legend__item">
              <span class="reportes-donut-legend__dot" style="background: ${color}; color: ${color};"></span>
              <span>${m.label}</span>
              <span class="reportes-donut-legend__pct">${m.pct}%</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ============================================
// RENDER: TOP CLIENTS (RANKING)
// ============================================

function renderTopClients(clients) {
  const container = $('reportesTopClients');
  if (!container) return;

  if (clients.length === 0) {
    container.innerHTML = renderEmpty('No hay datos de clientes');
    return;
  }

  const maxTotal = Math.max(...clients.map((c) => c.total));

  container.innerHTML = `
    <div class="reportes-ranking">
      ${clients.map((c, i) => {
        const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0;
        const posClass = i < 3 ? ` reportes-ranking__pos--${i + 1}` : '';
        const colorClass = BAR_CLASSES[i % BAR_CLASSES.length];
        return `
          <div class="reportes-ranking__item fade-in-up" style="animation-delay: ${i * 0.08}s;">
            <div class="reportes-ranking__pos${posClass}">${i + 1}</div>
            <div class="reportes-ranking__info">
              <div class="reportes-ranking__name">${c.nombre}</div>
              <div class="reportes-ranking__bar-track">
                <div class="reportes-ranking__bar-fill reportes-ranking__bar-fill--${colorClass}" style="width: 0%;" data-width="${pct}"></div>
              </div>
            </div>
            <div class="reportes-ranking__stat">${formatCurrency(c.total)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  setTimeout(() => {
    container.querySelectorAll('.reportes-ranking__bar-fill').forEach((bar) => {
      bar.style.width = bar.dataset.width + '%';
    });
  }, 300);
}

// ============================================
// RENDER: CATEGORY BARS (CSS BAR CHART)
// ============================================

function renderCategoryBars(categories) {
  const container = $('reportesCategoryBars');
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = renderEmpty('No hay datos por categoría');
    return;
  }

  const max = Math.max(...categories.map((c) => c.revenue));

  container.innerHTML = `
    <div class="reportes-bars" id="reportesCatBarsAnim" style="height: 180px;">
      ${categories.map((c, i) => {
        const pct = max > 0 ? (c.revenue / max) * 100 : 0;
        const colorClass = BAR_CLASSES[i % BAR_CLASSES.length];
        return `
          <div class="reportes-bar">
            <div class="reportes-bar__value">${formatCurrency(c.revenue)}</div>
            <div class="reportes-bar__fill reportes-bar__fill--${colorClass}" style="height: 0%;" data-height="${pct}"></div>
            <div class="reportes-bar__label">${capitalize(c.categoria)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  setTimeout(() => animateBars(container), 400);
}

// ============================================
// RENDER: TREND CHART (Canvas)
// ============================================

function renderTrendChart(dailySales) {
  const canvas = $('reportesTrendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  canvas.style.height = '260px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = 260;
  const padding = { top: 25, right: 25, bottom: 50, left: 75 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const values = dailySales.map((d) => d.total);
  const maxVal = Math.max(...values, 1);
  const roundedMax = Math.ceil(maxVal / 10000) * 10000 || 10000;

  // Data points
  const points = dailySales.map((d, i) => ({
    x: padding.left + (chartW / (dailySales.length - 1 || 1)) * i,
    y: padding.top + chartH - (d.total / roundedMax) * chartH,
    value: d.total,
    label: d.label,
  }));

  function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      const val = Math.round(roundedMax - (roundedMax / gridLines) * i);
      ctx.fillStyle = 'rgba(136, 136, 170, 0.6)';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(formatCurrency(val), padding.left - 10, y + 3);
    }

    // X-axis labels
    ctx.fillStyle = 'rgba(136, 136, 170, 0.5)';
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    points.forEach((p, i) => {
      if (i % 5 === 0 || i === points.length - 1) {
        ctx.fillText(p.label, p.x, H - padding.bottom + 18);
      }
    });

    // Axis lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, H - padding.bottom);
    ctx.lineTo(W - padding.right, H - padding.bottom);
    ctx.stroke();
  }

  // Animated drawing
  const animDuration = 1800;
  const animStart = performance.now();

  function drawFrame(now) {
    const elapsed = now - animStart;
    const progress = Math.min(elapsed / animDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const drawCount = Math.ceil(points.length * eased);

    ctx.clearRect(0, 0, W, H);
    drawGrid();

    if (drawCount < 2) {
      if (progress < 1) requestAnimationFrame(drawFrame);
      return;
    }

    // Gradient fill under line (multi-stop for depth)
    const fillGrad = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
    fillGrad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    fillGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
    fillGrad.addColorStop(1, 'rgba(0, 255, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, H - padding.bottom);
    for (let i = 0; i < drawCount; i++) {
      if (i === 0) {
        ctx.lineTo(points[i].x, points[i].y);
      } else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.lineTo(points[drawCount - 1].x, H - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Outer glow line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (let i = 0; i < drawCount; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.stroke();

    // Main neon line
    ctx.beginPath();
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 12;
    for (let i = 0; i < drawCount; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points with glow
    for (let i = 0; i < drawCount; i++) {
      const p = points[i];

      // Outer glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00FFFF';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (progress < 1) requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);

  // Hover tooltip
  canvas.addEventListener('mousemove', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const mx = e.clientX - canvasRect.left;
    const my = e.clientY - canvasRect.top;

    let closest = null;
    let minDist = Infinity;
    points.forEach((p) => {
      const dist = Math.abs(p.x - mx);
      if (dist < minDist && dist < 20) {
        minDist = dist;
        closest = p;
      }
    });

    canvas.style.cursor = closest ? 'pointer' : 'default';

    // Redraw with tooltip
    if (closest) {
      const freshProgress = 1;
      ctx.clearRect(0, 0, W, H);
      drawGrid();

      // Fill
      const fillGrad = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
      fillGrad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      fillGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
      fillGrad.addColorStop(1, 'rgba(0, 255, 255, 0.0)');
      ctx.beginPath();
      ctx.moveTo(points[0].x, H - padding.bottom);
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.lineTo(points[i].x, points[i].y);
        else {
          const prev = points[i - 1];
          const cpx = (prev.x + points[i].x) / 2;
          ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
        }
      }
      ctx.lineTo(points[points.length - 1].x, H - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Glow line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else {
          const prev = points[i - 1];
          const cpx = (prev.x + points[i].x) / 2;
          ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
        }
      }
      ctx.stroke();

      // Main line
      ctx.beginPath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 12;
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else {
          const prev = points[i - 1];
          const cpx = (prev.x + points[i].x) / 2;
          ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // All dots
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00FFFF';
        ctx.fill();
      }

      // Highlight closest dot
      ctx.beginPath();
      ctx.arc(closest.x, closest.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(closest.x, closest.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Vertical guide line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(closest.x, padding.top);
      ctx.lineTo(closest.x, H - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip box
      const tooltipText = `${closest.label}: ${formatCurrency(closest.value)}`;
      ctx.font = '11px "Share Tech Mono", monospace';
      const tw = ctx.measureText(tooltipText).width;
      const tx = Math.min(Math.max(closest.x - tw / 2 - 8, padding.left), W - padding.right - tw - 16);
      const ty = closest.y - 32;

      ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw + 16, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFFF';
      ctx.textAlign = 'left';
      ctx.fillText(tooltipText, tx + 8, ty + 16);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    // Reset to full animation state
    canvas.style.cursor = 'default';
    const fillGrad = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
    fillGrad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    fillGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
    fillGrad.addColorStop(1, 'rgba(0, 255, 255, 0.0)');

    ctx.clearRect(0, 0, W, H);
    drawGrid();

    ctx.beginPath();
    ctx.moveTo(points[0].x, H - padding.bottom);
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.lineTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.lineTo(points[points.length - 1].x, H - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 12;
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00FFFF';
      ctx.fill();
    }
  });

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderTrendChart(dailySales), 250);
  });
}

// ============================================
// RENDER: RECENT ORDERS
// ============================================

function renderRecentOrders(orders) {
  const container = $('reportesRecentOrders');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = renderEmpty('No hay pedidos recientes');
    return;
  }

  container.innerHTML = `
    <div class="reportes-recent">
      <div class="reportes-recent__row reportes-recent__row--header">
        <span>Cliente</span>
        <span>Items</span>
        <span>Mesa</span>
        <span>Estado</span>
        <span>Fecha</span>
      </div>
      ${orders.map((o, i) => {
        const itemCount = o.items ? o.items.length : 0;
        return `
          <div class="reportes-recent__row fade-in-up" style="animation-delay: ${i * 0.05}s;">
            <span class="reportes-recent__client">${o.cliente_nombre || 'N/A'}</span>
            <span class="reportes-recent__items">${itemCount} producto${itemCount !== 1 ? 's' : ''}</span>
            <span class="reportes-recent__items">${o.mesa || '—'}</span>
            <span><span class="badge badge--green" style="font-size: 0.6rem;">Completado</span></span>
            <span class="reportes-recent__date">${formatFechaFactura(o.created_at)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================
// UTILIDADES
// ============================================

function renderEmpty(msg) {
  return `
    <div class="reportes-empty">
      <div class="reportes-empty__icon">&#128202;</div>
      <p class="reportes-empty__text">${msg}</p>
    </div>
  `;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
