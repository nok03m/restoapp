/* =============================================
   starfield.js - Canvas animado de estrellas
   Movimiento autónomo tipo espacio profundo
   ============================================= */

let canvas, ctx;
let stars = [];
let shootingStars = [];
let animId;
let cameraX = 0, cameraY = 0;
const LAYERS = 3;
const STAR_COUNT_PER_LAYER = [150, 90, 45];
const COLORS = ['#ffffff', '#aaccff', '#ffeedd', '#ccddff', '#00FFFF'];

export function initStarfield() {
  canvas = document.createElement('canvas');
  canvas.id = 'starfield-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none;';
  document.body.prepend(canvas);
  ctx = canvas.getContext('2d');

  for (let i = 0; i < 3; i++) {
    const div = document.createElement('div');
    div.className = 'css-shooting-star';
    document.body.appendChild(div);
  }

  resize();
  createStars();
  bindEvents();
  animate();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStars() {
  stars = [];
  for (let layer = 0; layer < LAYERS; layer++) {
    for (let i = 0; i < STAR_COUNT_PER_LAYER[layer]; i++) {
      const angle = Math.random() * Math.PI * 2;
      const drift = Math.random() * 0.08 + 0.01;
      stars.push({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: Math.random() * canvas.height * 1.5 - canvas.height * 0.25,
        radius: Math.random() * (1.8 - layer * 0.4) + 0.2,
        layer,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.03 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        driftX: Math.cos(angle) * drift * (layer + 1) * 0.4,
        driftY: Math.sin(angle) * drift * (layer + 1) * 0.4,
      });
    }
  }
}

function spawnShootingStar() {
  if (shootingStars.length > 2) return;
  const fromEdge = Math.random() > 0.5;
  shootingStars.push({
    x: fromEdge ? -20 : Math.random() * canvas.width * 0.6,
    y: fromEdge ? Math.random() * canvas.height * 0.3 : -20,
    len: Math.random() * 150 + 80,
    speed: Math.random() * 10 + 6,
    angle: Math.PI / 5 + (Math.random() - 0.5) * 0.25,
    alpha: 1,
    decay: Math.random() * 0.012 + 0.006,
    width: Math.random() * 1.2 + 0.4,
  });
}

function bindEvents() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); createStars(); }, 200);
  });

  setInterval(() => {
    if (Math.random() > 0.25) spawnShootingStar();
  }, 4000 + Math.random() * 5000);
}

let time = 0;
function animate() {
  time += 0.016;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Drift autónomo de la cámara (simula nave flotando)
  cameraX += Math.sin(time * 0.08) * 0.12;
  cameraY += Math.cos(time * 0.06) * 0.08;

  for (const s of stars) {
    // Parallax por capa con drift de cámara
    const parallaxFactor = (s.layer + 1) * 0.3;
    const drawX = s.x + cameraX * parallaxFactor;
    const drawY = s.y + cameraY * parallaxFactor;

    // Parpadeo orgánico
    const twinkle = Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset);
    const twinkle2 = Math.sin(time * s.twinkleSpeed * 37 + s.twinkleOffset * 1.3);
    s.alpha = s.baseAlpha + (twinkle * 0.3 + twinkle2 * 0.1) * s.baseAlpha;

    // Deriva lenta autónoma
    s.x += s.driftX;
    s.y += s.driftY;

    // Wrap-around suave
    const margin = 50;
    if (s.x < -margin) s.x = canvas.width + margin * 0.5;
    if (s.x > canvas.width + margin) s.x = -margin * 0.5;
    if (s.y < -margin) s.y = canvas.height + margin * 0.5;
    if (s.y > canvas.height + margin) s.y = -margin * 0.5;

    // Glow
    const glow = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, s.radius * 5);
    glow.addColorStop(0, s.color);
    glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = Math.max(0, s.alpha * 0.25);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(drawX, drawY, s.radius * 5, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalAlpha = Math.max(0, s.alpha);
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Estrellas fugaces
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.x += Math.cos(ss.angle) * ss.speed;
    ss.y += Math.sin(ss.angle) * ss.speed;
    ss.alpha -= ss.decay;

    if (ss.alpha <= 0 || ss.x > canvas.width + 50 || ss.y > canvas.height + 50) {
      shootingStars.splice(i, 1);
      continue;
    }

    const tailX = ss.x - Math.cos(ss.angle) * ss.len;
    const tailY = ss.y - Math.sin(ss.angle) * ss.len;

    const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, 'rgba(0, 255, 255, 0.15)');
    grad.addColorStop(0.85, 'rgba(200, 220, 255, 0.6)');
    grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

    ctx.globalAlpha = ss.alpha;
    ctx.strokeStyle = grad;
    ctx.lineWidth = ss.width;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(ss.x, ss.y);
    ctx.stroke();

    const headGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 5);
    headGlow.addColorStop(0, `rgba(200, 240, 255, ${ss.alpha})`);
    headGlow.addColorStop(0.5, `rgba(0, 255, 255, ${ss.alpha * 0.4})`);
    headGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  animId = requestAnimationFrame(animate);
}

export function destroyStarfield() {
  cancelAnimationFrame(animId);
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
}
