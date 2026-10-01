/* ═══════════════════════════════════════════════════════════
   JAVIER ESPINOSA — TATTOO ARTIST PORTFOLIO
   Main JavaScript — Gallery, Lightbox, Animations, Carousel
   ═══════════════════════════════════════════════════════════ */

import './style.css';

// ─── DOM Ready ───
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initGalleryFilters();
  initLightbox();
  initLazyLoading();
  initScrollReveal();
  initCounterAnimation();
  initWhatsAppFloat();
  initScrollToTop();
  initSmoothScroll();
});

// ═══════════════════════ NAVBAR ═══════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

// ═══════════════════════ HAMBURGER MENU ═══════════════════════
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ═══════════════════════ GALLERY FILTERS ═══════════════════════
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items with animation
      galleryItems.forEach((item, index) => {
        const category = item.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          item.classList.remove('hidden');
          item.style.animation = `fadeInUp 0.4s ease-out ${index * 0.05}s both`;
        } else {
          item.classList.add('hidden');
          item.style.animation = '';
        }
      });
    });
  });
}

// ═══════════════════════ LAZY LOADING + IMAGE OPTIMIZATION ═══════════════════════
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px', // Start loading 100px before visible
      threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => loadImage(img));
  }
}

function loadImage(img) {
  const src = img.dataset.src;
  if (!src) return;

  const preloadImg = new Image();
  preloadImg.onload = () => {
    img.src = src;
    img.classList.add('loaded');
  };

  preloadImg.onerror = () => {
    // If WebP fails, try fallback JPG
    if (src.endsWith('.webp')) {
      const jpgSrc = src.replace('.webp', '.jpg');
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        img.src = jpgSrc;
        img.classList.add('loaded');
      };
      fallbackImg.onerror = () => {
        img.closest('.gallery-item-inner').style.background = 
          'linear-gradient(135deg, #1a1a1a, #222)';
        img.style.display = 'none';
      };
      fallbackImg.src = jpgSrc;
    } else {
      img.closest('.gallery-item-inner').style.background = 
        'linear-gradient(135deg, #1a1a1a, #222)';
      img.style.display = 'none';
    }
  };

  preloadImg.src = src;
}

// ═══════════════════════ LIGHTBOX ═══════════════════════
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  let currentIndex = 0;
  let visibleImages = [];

  function getVisibleImages() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.hidden) .gallery-img'));
  }

  function openLightbox(index) {
    visibleImages = getVisibleImages();
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const img = visibleImages[currentIndex];
    if (img) {
      lightboxImg.src = img.src || img.dataset.src;
      lightboxImg.alt = img.alt;
      lightboxCounter.textContent = `${currentIndex + 1} / ${visibleImages.length}`;
    }
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + visibleImages.length) % visibleImages.length;
    updateLightboxImage();
  }

  // Click on gallery items
  document.querySelectorAll('.gallery-item-inner').forEach((item, index) => {
    item.addEventListener('click', () => {
      const visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
      const actualIndex = visibleItems.indexOf(item.closest('.gallery-item'));
      openLightbox(actualIndex >= 0 ? actualIndex : index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigate(-1));
  lightboxNext.addEventListener('click', () => navigate(1));

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': navigate(-1); break;
      case 'ArrowRight': navigate(1); break;
    }
  });
}

// ═══════════════════════ SCROLL REVEAL ═══════════════════════
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

// ═══════════════════════ COUNTER ANIMATION ═══════════════════════
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count, 10);
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ═══════════════════════ WHATSAPP FLOAT ═══════════════════════
function initWhatsAppFloat() {
  const whatsappBtn = document.getElementById('whatsappFloat');

  setTimeout(() => {
    whatsappBtn.classList.add('visible');
  }, 2000);
}

// ═══════════════════════ SCROLL TO TOP ═══════════════════════
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ═══════════════════════ SMOOTH SCROLL ═══════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
