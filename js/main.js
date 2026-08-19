/* =============================================
   main.js - Boot global: nav, init, toasts, modals
   ============================================= */

import { AuthService } from './services/dataAdapter.js';
import { closeModal } from './utils/helpers.js';
import { initRippleEffects } from './utils/animations.js';

// --- Inicialización global ---
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActivePage();
  initNavAuth();
  initModalListeners();
  initRippleEffects();
});

// ============================================
// MOBILE HAMBURGER MENU
// ============================================

function initMobileMenu() {
  const hamburger = document.getElementById('navbarHamburger');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('navbar__hamburger--active');
    navLinks.classList.toggle('navbar__links--open');
  });

  // Cerrar al hacer clic en un link
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('navbar__hamburger--active');
      navLinks.classList.remove('navbar__links--open');
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('navbar__hamburger--active');
      navLinks.classList.remove('navbar__links--open');
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hamburger.classList.remove('navbar__hamburger--active');
      navLinks.classList.remove('navbar__links--open');
    }
  });
}

// ============================================
// DETECCIÓN DE PÁGINA ACTIVA
// ============================================

function initActivePage() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.navbar__link[data-page]');

  links.forEach((link) => {
    const page = link.dataset.page;
    const isActive =
      (page === 'home' && (path.endsWith('/') || path.endsWith('index.html'))) ||
      (page === 'pedidos' && path.includes('pedidos.html')) ||
      (page === 'admin' && path.includes('admin.html')) ||
      (page === 'login' && path.includes('login.html'));

    if (isActive) {
      link.classList.add('navbar__link--active');
    } else {
      link.classList.remove('navbar__link--active');
    }
  });
}

// ============================================
// AUTH NAVIGATION
// ============================================

function initNavAuth() {
  const adminLink = document.getElementById('navAdminLink');
  const authBtn = document.getElementById('navAuthBtn');
  const isLoggedIn = AuthService.isAuthenticated();

  if (adminLink) {
    if (isLoggedIn) {
      adminLink.classList.add('visible');
    } else {
      adminLink.classList.remove('visible');
    }
  }

  if (authBtn) {
    if (isLoggedIn) {
      authBtn.textContent = 'Cerrar Sesión';
      authBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthService.logout();
        window.location.href = getRelativePath('index.html');
      });
    } else {
      authBtn.textContent = 'Iniciar Sesión';
      authBtn.href = getRelativePath('pages/login.html');
    }
  }
}

// ============================================
// ROUTING HELPERS
// ============================================

/**
 * Resuelve rutas relativas según la página actual.
 * @param {string} target - Archivo destino.
 * @returns {string}
 */
function getRelativePath(target) {
  const path = window.location.pathname;
  const inRoot = path.endsWith('/') || path.endsWith('index.html');

  if (inRoot) {
    return target;
  }
  // Estamos en pages/
  if (target.startsWith('pages/')) {
    return target.replace('pages/', '');
  }
  return '../' + target;
}

// ============================================
// MODAL LISTENERS
// ============================================

function initModalListeners() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ============================================
// ADMIN SIDEBAR TOGGLE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.admin-sidebar__link[data-section]');
  if (sidebarLinks.length === 0) return;

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;

      sidebarLinks.forEach((l) => l.classList.remove('admin-sidebar__link--active'));
      link.classList.add('admin-sidebar__link--active');

      const productosSection = document.getElementById('adminSectionProductos');
      const facturacionSection = document.getElementById('adminSectionFacturacion');

      if (section === 'productos') {
        if (productosSection) productosSection.style.display = '';
        if (facturacionSection) facturacionSection.style.display = 'none';
      } else if (section === 'facturacion') {
        if (productosSection) productosSection.style.display = 'none';
        if (facturacionSection) facturacionSection.style.display = '';
      }
    });
  });
});
