(function () {
  var STYLE_ID = 'fullscreen-viewer-style';
  var OVERLAY_CLASS = 'fullscreen-viewer';
  var IMAGE_SELECTOR = '.gallery-image, .hero-image, .home-image';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      'body.fullscreen-viewer-open { overflow: hidden; }' +
      '.' + OVERLAY_CLASS + ' {' +
      'position: fixed;' +
      'inset: 0;' +
      'display: none;' +
      'align-items: center;' +
      'justify-content: center;' +
      'background: rgba(0, 0, 0, 0.92);' +
      'padding: 24px;' +
      'z-index: 9999;' +
      '}' +
      '.' + OVERLAY_CLASS + '.is-open { display: flex; }' +
      '.fullscreen-viewer-image {' +
      'max-width: min(96vw, 1600px);' +
      'max-height: 88vh;' +
      'width: auto;' +
      'height: auto;' +
      'object-fit: contain;' +
      'box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);' +
      '}' +
      '.fullscreen-viewer-close {' +
      'position: absolute;' +
      'top: 18px;' +
      'right: 18px;' +
      'border: 1px solid rgba(255, 255, 255, 0.55);' +
      'background: rgba(20, 20, 20, 0.75);' +
      'color: #ffffff;' +
      'font-family: Pretendard, "Noto Sans KR", sans-serif;' +
      'font-size: 14px;' +
      'font-weight: 600;' +
      'letter-spacing: 0.03em;' +
      'padding: 10px 14px;' +
      'cursor: pointer;' +
      '}' +
      '.fullscreen-viewer-close:focus-visible {' +
      'outline: 2px solid #f3e374;' +
      'outline-offset: 2px;' +
      '}' +
      '.fullscreen-viewer-target { cursor: zoom-in; }' +
      '@media (max-width: 767px) {' +
      '.fullscreen-viewer-close {' +
      'top: 14px;' +
      'right: 14px;' +
      'font-size: 12px;' +
      'padding: 8px 12px;' +
      '}' +
      '.' + OVERLAY_CLASS + ' { padding: 14px; }' +
      '.fullscreen-viewer-image { max-height: 84vh; }' +
      '}';

    document.head.appendChild(style);
  }

  function createViewer() {
    var overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');

    var closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'fullscreen-viewer-close';
    closeButton.setAttribute('aria-label', 'Close fullscreen image');
    closeButton.textContent = 'CLOSE';

    var image = document.createElement('img');
    image.className = 'fullscreen-viewer-image';
    image.alt = '';

    overlay.appendChild(closeButton);
    overlay.appendChild(image);
    document.body.appendChild(overlay);

    return {
      overlay: overlay,
      closeButton: closeButton,
      image: image
    };
  }

  function initScrollFadeIn(targets) {
    var fadeTargets = Array.prototype.slice.call(targets || []);

    if (!fadeTargets.length) {
      return;
    }

    function reveal(target) {
      target.classList.add('is-visible');
    }

    Array.prototype.forEach.call(fadeTargets, function (target) {
      target.classList.add('fade-in-on-scroll');
    });

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Array.prototype.forEach.call(fadeTargets, reveal);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(fadeTargets, reveal);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'
    });

    Array.prototype.forEach.call(fadeTargets, function (target) {
      observer.observe(target);
    });
  }

  function initViewer() {
    var targets = document.querySelectorAll(IMAGE_SELECTOR);

    if (!targets.length) {
      return;
    }

    initScrollFadeIn(targets);

    ensureStyles();

    var viewer = createViewer();
    var overlay = viewer.overlay;
    var closeButton = viewer.closeButton;
    var image = viewer.image;
    var lastFocused = null;

    function isOpen() {
      return overlay.classList.contains('is-open');
    }

    function closeViewer() {
      if (!isOpen()) {
        return;
      }

      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('fullscreen-viewer-open');
      image.removeAttribute('src');

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function openViewer(target) {
      var source = target.getAttribute('src');
      if (!source) {
        return;
      }

      lastFocused = target;
      image.src = source;
      image.alt = target.getAttribute('alt') || '';

      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('fullscreen-viewer-open');
      closeButton.focus();
    }

    Array.prototype.forEach.call(targets, function (target) {
      target.classList.add('fullscreen-viewer-target');

      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '0');
      }

      target.setAttribute('role', 'button');
      target.setAttribute('aria-label', 'Open image in fullscreen');

      target.addEventListener('click', function () {
        openViewer(target);
      });

      target.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openViewer(target);
        }
      });
    });

    closeButton.addEventListener('click', closeViewer);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeViewer();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeViewer();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewer);
  } else {
    initViewer();
  }
})();
