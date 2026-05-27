// Header scroll effect
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Hero dashboard animations
function initHeroDashboard() {
  // Live clock
  const timeEl = document.getElementById('heroTime');
  if (timeEl) {
    const tick = () => {
      timeEl.textContent = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  // Count-up animation
  function countUp(el, target, duration = 1600) {
    if (!el) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.childNodes[0].textContent = Math.round(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(document.getElementById('hvCharging'), 47);
        countUp(document.getElementById('hvDone'), 1284);
        countUp(document.getElementById('hvRate'), 98);
        const bar = document.getElementById('hvPowerBar');
        if (bar) setTimeout(() => bar.style.width = '73.8%', 300);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const card = document.querySelector('.hv-card');
  if (card) observer.observe(card);
}

document.addEventListener('DOMContentLoaded', initHeroDashboard);
