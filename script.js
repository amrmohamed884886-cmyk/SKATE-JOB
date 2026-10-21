const currentYear = document.getElementById('current-year');

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealGroups = [
    ['.hero-description, .hero-actions', 80],
    ['.section-heading', 0],
    ['.service-card', 110],
    ['.about-image, .about-copy > *, .about-number', 75],
    ['.contact > *:not(.contact-mark)', 65],
    ['.site-footer > *', 55],
  ];
  const revealTargets = new Set();
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -35px 0px',
  });

  revealGroups.forEach(([selector, stagger]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (revealTargets.has(element)) return;
      revealTargets.add(element);
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * stagger, 330)}ms`);
      revealObserver.observe(element);
    });
  });

  document.documentElement.classList.add('motion-ready', 'motion-start');

  const aboutImage = document.querySelector('.about-image');

  if (aboutImage) {
    let isNearViewport = false;
    let parallaxFrame = 0;

    const updateParallax = () => {
      parallaxFrame = 0;
      if (!isNearViewport) return;

      const bounds = aboutImage.getBoundingClientRect();
      const distanceFromCenter = window.innerHeight / 2 - (bounds.top + bounds.height / 2);
      const offset = Math.max(-18, Math.min(18, distanceFromCenter * 0.035));
      aboutImage.style.setProperty('--parallax-offset', `${offset.toFixed(1)}px`);
    };

    const scheduleParallax = () => {
      if (!parallaxFrame) {
        parallaxFrame = requestAnimationFrame(updateParallax);
      }
    };

    const parallaxObserver = new IntersectionObserver(([entry]) => {
      isNearViewport = entry.isIntersecting;
      if (isNearViewport) {
        scheduleParallax();
      } else {
        aboutImage.style.setProperty('--parallax-offset', '0px');
      }
    }, { rootMargin: '120px 0px' });

    parallaxObserver.observe(aboutImage);
    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax, { passive: true });

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', (event) => {
        if (!event.matches) return;
        parallaxObserver.disconnect();
        window.removeEventListener('scroll', scheduleParallax);
        window.removeEventListener('resize', scheduleParallax);
        aboutImage.style.setProperty('--parallax-offset', '0px');
      });
    }
  }
}
