/* ===============================================
   script.js – Portfolio Interactions & Animations
   =============================================== */

// ─── LOADER ────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    // Trigger page-load fade-in
    document.body.classList.remove('page-loading');
    document.body.classList.add('page-ready');
  }, 900);
});

// ─── HERO CANVAS (Particle Network) ────────────
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };
  const COUNT = 80, CONNECT = 120, SPEED = 0.35;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r  = Math.random() * 1.5 + 0.5;
      this.life = 0; this.maxLife = 300 + Math.random() * 400;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      // nudge toward mouse slightly
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 180) { this.x += dx * 0.0015; this.y += dy * 0.0015; }
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      if (this.life > this.maxLife) this.reset(false);
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168,85,247,${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < CONNECT) {
          const alpha = (1 - d / CONNECT) * 0.25;
          ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
})();

// ─── TYPED TEXT ─────────────────────────────────
(function typedEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const phrases = [
    'Computer Vision Engineer',
    'NLP Practitioner',
    'Full-Stack Developer',
    'AI Problem Solver',
    'AWS Cloud Graduate'
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; return setTimeout(tick, 2200); }
      setTimeout(tick, 70);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 400); }
      setTimeout(tick, 38);
    }
  }
  setTimeout(tick, 1800);
})();

// ─── NAVBAR ─────────────────────────────────────
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backTop').classList.toggle('visible', window.scrollY > 400);
  highlightNav();
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  document.querySelectorAll('#navLinks a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-section') === current);
  });
}

// ─── BACK TO TOP ────────────────────────────────
document.getElementById('backTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── AOS (custom IntersectionObserver) ──────────
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-animate');
        // animate skill bars when skills section visible
        if (e.target.closest('.skills-bars')) animateBars();
        // animate counters when about section visible
        if (e.target.classList.contains('stat')) animateCounter(e.target.querySelector('[data-count]'));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ─── SKILL BAR ANIMATION ────────────────────────
let barsAnimated = false;
function animateBars() {
  if (barsAnimated) return;
  barsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach(fill => {
    const target = fill.dataset.width;
    requestAnimationFrame(() => { fill.style.width = target + '%'; });
  });
}

// Also trigger when skills section enters view
(function skillsObserver() {
  const section = document.getElementById('skills');
  if (!section) return;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateBars(); obs.disconnect(); }
  }, { threshold: 0.2 });
  obs.observe(section);
})();

// ─── COUNTER ANIMATION ──────────────────────────
function animateCounter(el) {
  if (!el || el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = +el.dataset.count;
  const duration = 1400;
  const step = target / (duration / 16);
  let cur = 0;
  function tick() {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur).toLocaleString();
    if (cur < target) requestAnimationFrame(tick);
  }
  tick();
}

// ─── PROJECT CARD 3D TILT ───────────────────────
document.querySelectorAll('.project-card, .achieve-card, .cert-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const x   = e.clientX - r.left - r.width  / 2;
    const y   = e.clientY - r.top  - r.height / 2;
    const rX  = (y / r.height) * 6;
    const rY  = (x / r.width)  * -6;
    card.style.transform = `translateY(-6px) rotateX(${rX}deg) rotateY(${rY}deg)`;
    card.style.transition = 'transform 0.1s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), border-color 0.32s, box-shadow 0.32s';
  });
});

// ─── CONTACT FORM ───────────────────────────────
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('formSubmit');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  // Simulate send (replace with real backend / EmailJS / Formspree)
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    this.reset();
    const success = document.getElementById('formSuccess');
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 4000);
  }, 1200);
});

// ─── RESUME DOWNLOAD FALLBACK ───────────────────
document.getElementById('resumeBtn').addEventListener('click', function(e) {
  // If resume.pdf doesn't exist, open LinkedIn as fallback
  const link = this;
  const img = new Image();
  img.onerror = () => {
    e.preventDefault();
    window.open('https://www.linkedin.com/in/geedula-akshaya-b3150133a/', '_blank');
  };
  img.src = 'resume.pdf';
});

// ─── SMOOTH PAGE ENTRY ──────────────────────────
document.querySelectorAll('.hero-content .reveal-fade').forEach(el => {
  el.style.animationPlayState = 'running';
});
