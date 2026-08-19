/* =============================================
   pageTransition.js - Transiciones glitch MPA
   Destruye → Navega → Reconstruye
   ============================================= */

const DESTROY_DURATION = 700;

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

    // Solo links internos (no external, no #, no javascript:)
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

    // No interferir si tiene data-no-transition
    if (link.hasAttribute('data-no-transition')) return;

    // Ignorar si ya estamos en transición
    if (document.body.classList.contains('glitch-destroy')) return;

    e.preventDefault();
    navigateWithGlitch(href);
  });
}

function navigateWithGlitch(href) {
  const overlay = document.getElementById('glitchTransitionOverlay');
  const body = document.body;

  // Activar overlay
  overlay.classList.add('active');

  // Marcar que venimos de transición
  sessionStorage.setItem('glitchTransition', '1');

  // Fase 1: Destrucción
  body.classList.add('glitch-destroy');

  setTimeout(() => {
    // Navegar
    window.location.href = href;
  }, DESTROY_DURATION);
}

function playEntryAnimation() {
  // Si venimos de una transición (sessionStorage flag), reproducir reconstrucción
  const wasTransitioning = sessionStorage.getItem('glitchTransition');

  if (wasTransitioning) {
    sessionStorage.removeItem('glitchTransition');
    document.body.classList.add('glitch-reconstruct');
  }
}

// Llamar antes de que la página se descargue para marcar la transición
window.addEventListener('beforeunload', () => {
  if (document.body.classList.contains('glitch-destroy')) {
    sessionStorage.setItem('glitchTransition', '1');
  }
});
