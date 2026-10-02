/* ═══════════════════════════════════════════════════════════
   JAVIER ESPINOSA — TATTOO ARTIST PORTFOLIO
   Main JavaScript — Responsive Navigation, Gallery, Lightbox
   ═══════════════════════════════════════════════════════════ */

import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initGalleryFilters();
  initLightbox();
  initLazyLoading();
  initScrollReveal();
  initWhatsAppFab();
  initSmoothScroll();
});

// ═══════════════════════ NAVBAR SCROLL STATE ═══════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
}

// ═══════════════════════ RESPONSIVE MOBILE MENU ═══════════════════════
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  if (!menuToggle || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);

  // Close when clicking any nav link
  navMenu.querySelectorAll('.nav-link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      toggleMenu();
    }
  });
}

// ═══════════════════════ GALLERY FILTERS ═══════════════════════
function initGalleryFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const galleryCards = document.querySelectorAll('.gallery-card');
  if (!filterPills.length || !galleryCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;

      // Update pill active states
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      // Filter gallery cards with smooth stagger
      let visibleIndex = 0;
      galleryCards.forEach(card => {
        const category = card.dataset.category;
        const matches = filter === 'all' || category === filter;

        if (matches) {
          card.classList.remove('hidden');
          card.style.animation = `cardFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${visibleIndex * 0.04}s both`;
          visibleIndex++;
        } else {
          card.classList.add('hidden');
          card.style.animation = '';
        }
      });
    });
  });
}

// ═══════════════════════ LIGHTBOX VIEWER ═══════════════════════
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  if (!lightbox || !lightboxImg) return;

  let currentIndex = 0;
  let activeCards = [];

  function getVisibleCards() {
    return Array.from(document.querySelectorAll('.gallery-card:not(.hidden) .gallery-card-img'));
  }

  function openLightbox(index) {
    activeCards = getVisibleCards();
    if (!activeCards.length) return;
    currentIndex = (index >= 0 && index < activeCards.length) ? index : 0;
    updateImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateImage() {
    const targetImg = activeCards[currentIndex];
    if (targetImg) {
      lightboxImg.src = targetImg.src || targetImg.dataset.src;
      lightboxImg.alt = targetImg.alt || 'Tatuaje ampliado Javier Espinosa';
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentIndex + 1} / ${activeCards.length}`;
      }
    }
  }

  function navigate(direction) {
    if (!activeCards.length) return;
    currentIndex = (currentIndex + direction + activeCards.length) % activeCards.length;
    updateImage();
  }

  // Bind clicks on gallery cards
  document.querySelectorAll('.gallery-card-inner').forEach(cardInner => {
    cardInner.addEventListener('click', () => {
      const allVisible = Array.from(document.querySelectorAll('.gallery-card:not(.hidden)'));
      const parentCard = cardInner.closest('.gallery-card');
      const idx = allVisible.indexOf(parentCard);
      openLightbox(idx);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigate(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigate(1));

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch Swipe for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        navigate(-1); // Swipe right -> Previous
      } else {
        navigate(1);  // Swipe left -> Next
      }
    }
  }
}

// ═══════════════════════ LAZY LOADING ═══════════════════════
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy');
  if (!lazyImages.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImg(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '120px 0px',
      threshold: 0.01
    });

    lazyImages.forEach(img => observer.observe(img));
  } else {
    lazyImages.forEach(img => loadImg(img));
  }
}

function loadImg(img) {
  const src = img.dataset.src;
  if (!src) return;

  const temp = new Image();
  temp.onload = () => {
    img.src = src;
    img.classList.add('loaded');
  };
  temp.onerror = () => {
    if (src.endsWith('.webp')) {
      const fallback = src.replace('.webp', '.jpg');
      img.src = fallback;
      img.classList.add('loaded');
    }
  };
  temp.src = src;
}

// ═══════════════════════ SCROLL REVEAL ═══════════════════════
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!reveals.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('revealed'));
  }
}

// ═══════════════════════ WHATSAPP FAB ═══════════════════════
function initWhatsAppFab() {
  const fab = document.getElementById('whatsappFloat');
  if (!fab) return;

  let shown = false;
  const onScroll = () => {
    if (!shown && window.scrollY > 200) {
      fab.classList.add('visible');
      shown = true;
      window.removeEventListener('scroll', onScroll);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Fallback timer if user stays at top
  setTimeout(() => {
    if (!shown) {
      fab.classList.add('visible');
      shown = true;
    }
  }, 2500);
}

// ═══════════════════════ SMOOTH SCROLL ═══════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
