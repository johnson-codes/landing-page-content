(function () {
  var header = document.getElementById('site-header');
  var menuToggle = document.getElementById('menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var leadForm = document.getElementById('lead-form');
  var formFields = document.getElementById('lead-form-fields');
  var formSuccess = document.getElementById('form-success');

  /* Header shadow on scroll */
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  }, { passive: true });

  /* Mobile menu */
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('is-open');
        el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Form validation & submission */
  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(field, message) {
    var group = field.closest('.form-group');
    var error = group.querySelector('.form-error');
    group.classList.add('has-error');
    field.classList.add('is-invalid');
    if (error) error.textContent = message;
  }

  function clearFieldError(field) {
    var group = field.closest('.form-group');
    group.classList.remove('has-error');
    field.classList.remove('is-invalid');
  }

  if (leadForm) {
    leadForm.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', function () { clearFieldError(field); });
      field.addEventListener('change', function () { clearFieldError(field); });
    });

    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var required = leadForm.querySelectorAll('[required]');

      required.forEach(function (field) {
        clearFieldError(field);
        if (!field.value.trim()) {
          setFieldError(field, 'This field is required.');
          valid = false;
        }
      });

      var email = leadForm.querySelector('#email');
      if (email && email.value.trim() && !validateEmail(email.value.trim())) {
        setFieldError(email, 'Please enter a valid email address.');
        valid = false;
      }

      if (!valid) {
        var firstError = leadForm.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      leadForm.classList.add('is-submitted');
      if (formSuccess) formSuccess.classList.add('is-visible');
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* Stats count-up */
  var statBand = document.querySelector('.stats-band');
  var statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function formatStatValue(value, suffix) {
    return Math.round(value) + (suffix || '');
  }

  function setStatFinal(el) {
    var target = parseFloat(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = formatStatValue(target, suffix);
    el.classList.remove('is-counting');
  }

  function animateStat(el, duration, delay) {
    var target = parseFloat(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var startTime;

    function frame(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime - delay;
      if (elapsed < 0) {
        requestAnimationFrame(frame);
        return;
      }
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatStatValue(target * eased, suffix);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatStatValue(target, suffix);
        el.classList.remove('is-counting');
      }
    }

    el.classList.add('is-counting');
    requestAnimationFrame(frame);
  }

  function initStats(reducedMotion) {
    if (!statNumbers.length) return;

    document.querySelectorAll('.stats-band .stat-item').forEach(function (el, i) {
      el.style.setProperty('--stat-delay', (i * 100) + 'ms');
    });

    if (reducedMotion) {
      statNumbers.forEach(setStatFinal);
      return;
    }

    if (!statBand) return;

    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statsObserver.unobserve(entry.target);
        statNumbers.forEach(function (el, i) {
          animateStat(el, 1400, i * 120);
        });
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -24px 0px' });

    statsObserver.observe(statBand);
  }

  /* Scroll reveal */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  document.querySelectorAll('.reveal-group').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
    });
  });

  if (reducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    initStats(true);
    return;
  }

  document.querySelectorAll('.hero .reveal').forEach(function (el, i) {
    el.style.setProperty('--reveal-delay', (i * 120) + 'ms');
    requestAnimationFrame(function () { el.classList.add('is-visible'); });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) {
    if (!el.closest('.hero')) observer.observe(el);
  });

  initStats(false);
})();
