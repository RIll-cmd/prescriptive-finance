// ============================================
// PARTICLE FIELD
// ============================================
class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.w = this.canvas.width = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.floor((this.w * this.h) / 14000);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.35 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.008 + 0.004,
        isBlue: Math.random() > 0.5,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.init(); });
    window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      if (p.x < 0) p.x = this.w;
      if (p.x > this.w) p.x = 0;
      if (p.y < 0) p.y = this.h;
      if (p.y > this.h) p.y = 0;
      const a = Math.max(0, Math.min(1, p.alpha + Math.sin(p.pulse) * 0.12));
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const f = (100 - dist) / 100 * 0.25;
        p.x += (dx / dist) * f;
        p.y += (dy / dist) * f;
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = p.isBlue
        ? `rgba(56, 105, 210, ${a})`
        : `rgba(197, 124, 249, ${a})`;
      this.ctx.fill();
    }
    // Connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i], b = this.particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 90) {
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(130, 110, 230, ${(1 - d / 90) * 0.05})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 3D CREDIT CARD — TILT + GLARE + SPRING
// ============================================
class Card3D {
  constructor(sceneEl, cardEl, glareEl) {
    this.scene = sceneEl;
    this.card = cardEl;
    this.glare = glareEl;

    // Current state (what's rendered)
    this.current = { rx: 0, ry: 0, gx: 50, gy: 50 };
    // Target state (where we want to go)
    this.target = { rx: 0, ry: 0, gx: 50, gy: 50 };
    // Is mouse over?
    this.hovering = false;
    // Smoothing factor — lower = more inertia/weight
    this.smoothing = 0.08;

    this.bind();
    this.loop();
  }

  bind() {
    this.scene.addEventListener('mouseenter', () => {
      this.hovering = true;
    });

    this.scene.addEventListener('mousemove', (e) => {
      const rect = this.scene.getBoundingClientRect();
      // Normalized -0.5 to 0.5
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      // Target rotation (capped)
      this.target.ry = nx * 25;  // left/right tilt
      this.target.rx = -ny * 20; // up/down tilt

      // Glare position (0-100%)
      this.target.gx = (nx + 0.5) * 100;
      this.target.gy = (ny + 0.5) * 100;
    });

    this.scene.addEventListener('mouseleave', () => {
      this.hovering = false;
      this.target.rx = 0;
      this.target.ry = 0;
      this.target.gx = 50;
      this.target.gy = 50;
    });
  }

  lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  loop() {
    // Smooth interpolation toward target
    const s = this.hovering ? this.smoothing : 0.05;

    this.current.rx = this.lerp(this.current.rx, this.target.rx, s);
    this.current.ry = this.lerp(this.current.ry, this.target.ry, s);
    this.current.gx = this.lerp(this.current.gx, this.target.gx, s * 1.5);
    this.current.gy = this.lerp(this.current.gy, this.target.gy, s * 1.5);

    // Apply transform
    this.card.style.transform =
      `rotateX(${this.current.rx.toFixed(2)}deg) rotateY(${this.current.ry.toFixed(2)}deg)`;

    // Dynamic shadow based on tilt
    const shadowX = -this.current.ry * 0.8;
    const shadowY = this.current.rx * 0.5 + 12;
    const shadowSpread = this.hovering ? 50 : 30;
    this.card.style.boxShadow = `
      ${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowSpread}px rgba(0, 0, 0, 0.45),
      ${(shadowX * 0.3).toFixed(1)}px ${(shadowY * 0.5).toFixed(1)}px 15px rgba(197, 124, 249, ${this.hovering ? 0.12 : 0}),
      0 0 0 1px rgba(255, 255, 255, 0.07) inset
    `;

    // Move glare
    this.glare.style.setProperty('--glare-x', this.current.gx.toFixed(1) + '%');
    this.glare.style.setProperty('--glare-y', this.current.gy.toFixed(1) + '%');

    requestAnimationFrame(() => this.loop());
  }
}

// ============================================
// CHART DATA & RENDER
// ============================================
const MONTHS = [
  { key: 'J', label: 'January 2024',   income: 2200, expense: 1800 },
  { key: 'F', label: 'February 2024',  income: 2600, expense: 2100 },
  { key: 'M', label: 'March 2024',     income: 3100, expense: 2500 },
  { key: 'A', label: 'April 2024',     income: 2800, expense: 2200 },
  { key: 'M', label: 'May 2024',       income: 3400, expense: 2800 },
  { key: 'J', label: 'June 2024',      income: 3800, expense: 3200 },
  { key: 'J', label: 'July 2024',      income: 3200, expense: 2600 },
  { key: 'A', label: 'August 2024',    income: 2750, expense: 2100 },
  { key: 'S', label: 'September 2024', income: 3600, expense: 2900 },
  { key: 'O', label: 'October 2024',   income: 4100, expense: 3400 },
  { key: 'N', label: 'November 2024',  income: 4500, expense: 3800 },
  { key: 'D', label: 'December 2024',  income: 4800, expense: 4200 },
];
const CHART_MAX = 5000;

function renderChart() {
  const bars = document.getElementById('chartBars');
  const xAxis = document.getElementById('chartXAxis');
  const tooltip = document.getElementById('chartTooltip');
  bars.innerHTML = '';
  xAxis.innerHTML = '';

  MONTHS.forEach((m, i) => {
    const group = document.createElement('div');
    group.className = 'bar-group';
    const ib = document.createElement('div');
    ib.className = 'bar income-bar';
    ib.style.height = '0%';
    const eb = document.createElement('div');
    eb.className = 'bar expense-bar';
    eb.style.height = '0%';
    group.append(ib, eb);

    group.addEventListener('mouseenter', () => {
      tooltip.querySelector('strong').textContent = m.label;
      tooltip.querySelector('.tt-income').textContent = '$' + m.income.toLocaleString();
      tooltip.querySelector('.tt-expense').textContent = '$' + m.expense.toLocaleString();
      tooltip.classList.add('visible');
    });
    group.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    bars.appendChild(group);

    requestAnimationFrame(() => {
      setTimeout(() => {
        ib.style.height = `${(m.income / CHART_MAX) * 100}%`;
        eb.style.height = `${(m.expense / CHART_MAX) * 100}%`;
      }, 200 + i * 60);
    });

    const label = document.createElement('span');
    label.textContent = m.key;
    xAxis.appendChild(label);
  });
}

// ============================================
// BALANCE COUNTER
// ============================================
function animateBalance() {
  const el = document.querySelector('.amount-value');
  const target = 18987.19;
  const dur = 2000;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = (target * e).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============================================
// PROGRESS BARS
// ============================================
function animateProgress() {
  document.querySelectorAll('.goal-progress-fill').forEach((fill, i) => {
    setTimeout(() => { fill.style.width = fill.dataset.progress + '%'; }, 600 + i * 200);
  });
}

// ============================================
// INTERACTIONS
// ============================================
function initInteractions() {
  // Sidebar
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Transfer avatars
  const avatars = document.querySelectorAll('.transfer-avatar');
  avatars.forEach(av => {
    av.addEventListener('click', () => {
      avatars.forEach(a => a.classList.remove('active-transfer-avatar'));
      av.classList.add('active-transfer-avatar');
    });
  });

  // Transfer button
  const btn = document.getElementById('transferBtn');
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(0.96)';
    setTimeout(() => { btn.style.transform = ''; }, 150);
  });
}

// ============================================
// TRANSACTION ROW STAGGER
// ============================================
function animateRows() {
  document.querySelectorAll('#transactionsBody tr').forEach((row, i) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-10px)';
    row.style.transition = `all 0.4s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.08}s`;
    requestAnimationFrame(() => {
      setTimeout(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      }, 50);
    });
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Particle field
  const canvas = document.getElementById('particleCanvas');
  if (canvas) new ParticleField(canvas);

  // 3D Credit Card
  const scene = document.getElementById('cardScene');
  const card = document.getElementById('stripeCard');
  const glare = document.getElementById('cardGlare');
  if (scene && card && glare) new Card3D(scene, card, glare);

  // Dashboard UI
  renderChart();
  animateBalance();
  animateProgress();
  initInteractions();
  animateRows();

  // Default chart tooltip
  setTimeout(() => {
    document.getElementById('chartTooltip').classList.add('visible');
  }, 1500);
});
