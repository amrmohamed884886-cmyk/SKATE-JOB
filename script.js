const currentYear = document.getElementById('current-year');

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pageCurtain = document.querySelector('.page-transition');
const supportsNativePageTransitions = 'startViewTransition' in document;

if (pageCurtain && !supportsNativePageTransitions && !reducedMotion.matches) {
  const transitionKey = 'skate-job-page-transition';
  let navigationStarted = false;

  try {
    if (sessionStorage.getItem(transitionKey) === 'enter') {
      sessionStorage.removeItem(transitionKey);
      document.documentElement.classList.add('page-transition-entering');

      const finishEntry = () => {
        document.documentElement.classList.remove('page-transition-entering');
      };

      pageCurtain.addEventListener('animationend', finishEntry, { once: true });
      window.setTimeout(finishEntry, 1000);
    }
  } catch (error) {
    console.error('Could not restore the page transition state.', error);
  }

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const link = event.target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) return;
    if (link.target && link.target !== '_self') return;

    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      (destination.pathname === window.location.pathname &&
        destination.search === window.location.search)
    ) {
      return;
    }

    if (reducedMotion.matches) return;

    event.preventDefault();
    if (navigationStarted) return;
    navigationStarted = true;

    try {
      sessionStorage.setItem(transitionKey, 'enter');
    } catch (error) {
      console.error('Could not save the page transition state.', error);
    }

    let destinationNavigated = false;
    let navigationTimeout;
    const navigate = () => {
      if (destinationNavigated) return;
      destinationNavigated = true;
      window.clearTimeout(navigationTimeout);
      window.location.assign(destination.href);
    };

    pageCurtain.addEventListener('transitionend', (transitionEvent) => {
      if (transitionEvent.propertyName === 'transform') navigate();
    }, { once: true });
    document.documentElement.classList.add('page-transition-leaving');
    navigationTimeout = window.setTimeout(navigate, 700);
  });
}

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
