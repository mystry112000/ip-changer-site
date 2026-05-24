// ─── Scroll-Active Letter Particle System ───
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Letter pool — characters that particles morph through
const CHARS = '01ABCDEF⚡🌐🔒🛡️<>{}[]#$%&+-*/~^';
let scrollRatio = 0; // 0 at top, 1 at bottom

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollRatio = Math.min(1, window.scrollY / max);
});

class LetterParticle {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 18 + 10;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4 + 0.15;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.01;
    this.charIndex = Math.floor(Math.random() * CHARS.length);
    this.char = CHARS[this.charIndex];
    this.opacity = Math.random() * 0.5 + 0.15;
    this.hue = Math.random() * 60 + 180; // blue-cyan range
    this.life = Math.random() * 300 + 200;
    this.maxLife = this.life;
    if (!init) {
      // fade in from right side
      this.x = w + 20;
      this.y = Math.random() * h;
    }
  }

  update(scroll) {
    // Base movement
    this.x += this.speedX + scroll * 0.3;
    this.y += this.speedY - scroll * 0.2;
    this.rotation += this.rotSpeed + scroll * 0.002;

    // Slowly change character based on scroll
    if (Math.random() < 0.005 + scroll * 0.01) {
      this.charIndex = (this.charIndex + 1) % CHARS.length;
      this.char = CHARS[this.charIndex];
    }

    // Hue shifts with scroll
    this.hue = 180 + scroll * 60 + Math.sin(Date.now() * 0.001) * 20;

    // Size pulses with scroll
    this.size = (Math.random() * 18 + 10) + scroll * 8;

    // Opacity varies with scroll
    this.opacity = Math.random() * 0.3 + 0.1 + scroll * 0.4;

    // Life / fade
    this.life--;
    if (this.life <= 0 || this.x < -50 || this.y < -50 || this.x > w + 50 || this.y > h + 50) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Glow effect
    ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${this.opacity * 0.5})`;
    ctx.shadowBlur = 15 + scrollRatio * 15;

    ctx.font = `${this.size}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
    ctx.fillText(this.char, 0, 0);

    ctx.restore();
  }
}

// ─── Create particles ───
const particles = [];
const count = 120;
for (let i = 0; i < count; i++) {
  particles.push(new LetterParticle());
}

// ─── Draw loop ───
function draw() {
  ctx.clearRect(0, 0, w, h);

  // Background gradient that changes with scroll
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  g.addColorStop(0, `hsl(${220 + scrollRatio * 30}, 60%, ${8 + scrollRatio * 5}%)`);
  g.addColorStop(1, `hsl(${240 + scrollRatio * 20}, 70%, ${3 + scrollRatio * 3}%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Subtle horizontal scan lines that intensify with scroll
  ctx.fillStyle = `rgba(0, 212, 255, ${0.015 + scrollRatio * 0.02})`;
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // Update & draw each particle
  for (const p of particles) {
    p.update(scrollRatio);
    p.draw(ctx);
  }

  // ─── Matrix-like rain (intensifies with scroll) ───
  ctx.fillStyle = `rgba(0, 212, 255, ${0.03 + scrollRatio * 0.06})`;
  ctx.font = '10px monospace';
  const cols = Math.floor(w / 20);
  for (let i = 0; i < cols * scrollRatio; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y);
  }

  requestAnimationFrame(draw);
}

draw();

// ─── Smooth scroll for anchor links ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Copy command to clipboard ───
function copyCmd(btn) {
  const cmd = btn.previousElementSibling;
  const text = cmd.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ─── Navbar hide/show on scroll ───
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > lastY && window.scrollY > 100) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(0)';
  }
  lastY = window.scrollY;
});
