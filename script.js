const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-navigation');
const currentYear = document.getElementById('current-year');

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
    navigation.classList.toggle('is-open', !isExpanded);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      navigation.classList.remove('is-open');
    }
  });
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealGroups = [
    ['.hero-copy > *', 90],
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

  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(() => {
    document.documentElement.classList.add('motion-start');
  });
}
