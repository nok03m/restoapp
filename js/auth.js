/* =============================================
   auth.js - Lógica de autenticación y sesión
   Maneja login form, logout, y gates de acceso.
   Usa Firebase Authentication.
   ============================================= */

import { AuthService } from './services/dataAdapter.js';
import { showToast, $ } from './utils/helpers.js';

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('loginForm')) {
    initLoginForm();
  }
  if (document.getElementById('adminGate')) {
    initAdminGate();
  }
});

// ============================================
// LOGIN FORM
// ============================================

function initLoginForm() {
  const form = $('loginForm');
  const submitBtn = $('loginSubmitBtn');
  const btnText = $('loginBtnText');
  const btnSpinner = $('loginBtnSpinner');

  // Si ya está autenticado, redirigir al admin
  if (AuthService.isAuthenticated()) {
    window.location.href = '../pages/admin.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = ($('loginEmail').value || '').trim();
    const password = $('loginPassword').value || '';

    // Validación local
    if (!email) {
      showLoginError('Ingresa tu correo electrónico');
      shakeLoginBox();
      return;
    }
    if (!password) {
      showLoginError('Ingresa tu contraseña');
      shakeLoginBox();
      return;
    }

    // Estado de carga
    setLoginLoading(true);

    const result = await AuthService.login(email, password);

    if (result.success) {
      hideLoginError();
      showToast('Sesión iniciada correctamente', 'success');
      // Pequeña pausa para que el usuario vea el toast
      setTimeout(() => {
        window.location.href = '../pages/admin.html';
      }, 400);
    } else {
      showLoginError(result.error);
      shakeLoginBox();
      setLoginLoading(false);
    }
  });

  // Enter en cualquier campo envía el form
  ['loginEmail', 'loginPassword'].forEach((id) => {
    $(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
      }
    });
  });
}

function setLoginLoading(isLoading) {
  const submitBtn = $('loginSubmitBtn');
  const btnText = $('loginBtnText');
  const btnSpinner = $('loginBtnSpinner');

  if (submitBtn) submitBtn.disabled = isLoading;
  if (btnText) btnText.style.display = isLoading ? 'none' : '';
  if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
}

function showLoginError(message) {
  const errorDiv = $('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('visible');
  }
}

function hideLoginError() {
  const errorDiv = $('loginError');
  if (errorDiv) {
    errorDiv.classList.remove('visible');
  }
}

function shakeLoginBox() {
  const box = $('loginBox');
  if (!box) return;
  box.classList.add('login-shake');
  setTimeout(() => box.classList.remove('login-shake'), 500);
}

// ============================================
// ADMIN GATE
// ============================================

function initAdminGate() {
  const adminGate = $('adminGate');
  const adminUnauthorized = $('adminUnauthorized');
  const navAuthBtn = $('navAuthBtn');

  const session = AuthService.getSession();

  if (!session) {
    adminGate.style.display = 'none';
    adminUnauthorized.style.display = 'flex';
    if (navAuthBtn) navAuthBtn.style.display = '';
  } else {
    adminGate.style.display = '';
    adminUnauthorized.style.display = 'none';
    if (navAuthBtn) navAuthBtn.style.display = 'none';

    populateAdminInfo(session);
    initLogoutButton();
  }
}

function populateAdminInfo(session) {
  const adminName = $('adminName');
  const adminRole = $('adminRole');
  const adminAvatar = $('adminAvatar');
  const adminWelcome = $('adminWelcome');

  if (adminName) adminName.textContent = session.nombre;
  if (adminRole) {
    adminRole.textContent = session.rol === 'admin' ? 'Administrador' : 'Mesero';
  }
  if (adminAvatar) {
    adminAvatar.textContent = session.nombre.charAt(0).toUpperCase();
  }
  if (adminWelcome) {
    adminWelcome.textContent = `Bienvenido, ${session.nombre}`;
  }
}

function initLogoutButton() {
  const logoutBtn = $('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    const originalText = logoutBtn.innerHTML;
    logoutBtn.innerHTML = '&#10148; Cerrando...';

    await AuthService.logout();
    showToast('Sesión cerrada', 'info');
    window.location.href = '../pages/login.html';
  });
}
