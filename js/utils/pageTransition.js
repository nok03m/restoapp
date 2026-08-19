/* =============================================
   pageTransition.js - Transiciones glitch MPA
   Señal digital: destrucción → reconstrucción
   ============================================= */

const DESTROY_DURATION = 650;
const NAV_DELAY = 580;

export function initPageTransitions() {
  createOverlay();
  interceptLinks();
  playEntryAnimation();
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'glitchTransitionOverlay';
  overlay.className = 'glitch-transition-overlay';
  document.body.appendChild(overlay);
}

function interceptLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
    if (href.startsWith('#')) return;
    if (link.hasAttribute('data-no-transition')) return;
    if (document.body.classList.contains('glitch-destroy')) return;

    // No transición si es el mismo link
    try {
      const current = new URL(window.location.href);
      const target = new URL(href, window.location.href);
      if (current.pathname === target.pathname) return;
    } catch {}

    e.preventDefault();
    navigateWithGlitch(href);
  });
}

function navigateWithGlitch(href) {
  const overlay = document.getElementById('glitchTransitionOverlay');
  const body = document.body;

  // Flash dinámico en momentos clave
  flashAt(overlay, 150);
  flashAt(overlay, 350);
  flashAt(overlay, 500);

  // Activar overlay (scanlines + blocks)
  overlay.classList.add('active');

  // Marcar transición
  sessionStorage.setItem('glitchTransition', '1');

  // Destrucción
  body.classList.add('glitch-destroy');

  // Navegar después de la destrucción
  setTimeout(() => {
    window.location.href = href;
  }, NAV_DELAY);
}

function flashAt(overlay, delay) {
  setTimeout(() => {
    overlay.classList.remove('flash');
    void overlay.offsetWidth;
    overlay.classList.add('flash');
  }, delay);

  setTimeout(() => {
    overlay.classList.remove('flash');
  }, delay + 600);
}

function playEntryAnimation() {
  const wasTransitioning = sessionStorage.getItem('glitchTransition');

  if (wasTransitioning) {
    sessionStorage.removeItem('glitchTransition');
    document.body.classList.add('glitch-reconstruct');
  }
}

window.addEventListener('beforeunload', () => {
  if (document.body.classList.contains('glitch-destroy')) {
    sessionStorage.setItem('glitchTransition', '1');
  }
});
