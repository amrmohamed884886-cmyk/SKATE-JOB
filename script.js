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
