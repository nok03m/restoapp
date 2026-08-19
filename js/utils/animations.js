/* =============================================
   animations.js - Funciones de transiciones neon
   ============================================= */

/**
 * Aplica una animación de entrada a un elemento con clase CSS.
 * @param {HTMLElement} el
 * @param {string} animationClass - Clase CSS de animación.
 * @param {number} duration - Duración en ms.
 */
export function animateIn(el, animationClass = 'fade-in-up', duration = 500) {
  if (!el) return;
  el.style.opacity = '0';
  el.classList.add(animationClass);
  el.style.animationDuration = `${duration}ms`;

  requestAnimationFrame(() => {
    el.style.opacity = '';
  });

  setTimeout(() => {
    el.classList.remove(animationClass);
    el.style.animationDuration = '';
  }, duration);
}

/**
 * Aplica efecto de glitch temporal a un elemento.
 * @param {HTMLElement} el
 * @param {number} duration - Duración del efecto en ms.
 */
export function glitchEffect(el, duration = 300) {
  if (!el) return;
  el.classList.add('glitch');
  setTimeout(() => el.classList.remove('glitch'), duration);
}

/**
 * Efecto de ripple neon al hacer clic.
 * @param {Event} event - Evento de clic.
 * @param {string} color - Color del ripple en CSS.
 */
export function createRipple(event, color = 'rgba(0, 255, 255, 0.4)') {
  const el = event.currentTarget;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const ripple = document.createElement('span');

  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${event.clientX - rect.left - size / 2}px;
    top: ${event.clientY - rect.top - size / 2}px;
    background: ${color};
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 10;
  `;

  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

/**
 * Inicializa efectos de ripple en todos los botones .btn.
 */
export function initRippleEffects() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', createRipple);
  });
}

/**
 * Efecto de typewriter en un elemento de texto.
 * @param {HTMLElement} el
 * @param {string} text
 * @param {number} speed - ms por carácter.
 */
export function typewriter(el, text, speed = 50) {
  if (!el) return;
  el.textContent = '';
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

/**
 * Aplica animación escalonada a una lista de elementos.
 * @param {NodeList|HTMLElement[]} elements
 * @param {string} animationClass
 * @param {number} staggerMs - Delay entre cada elemento.
 */
export function staggerAnimation(elements, animationClass = 'fade-in-up', staggerMs = 100) {
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.classList.add(animationClass);
      el.style.opacity = '';
    }, index * staggerMs);
  });
}
