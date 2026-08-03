// Synergy Diagold FZCO — shared site behaviour

(function () {
  // Full-screen nav overlay
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');
  var closeBtn = document.querySelector('.nav-overlay-close');
  function openNav () { overlay.classList.add('open'); document.body.classList.add('nav-open'); }
  function closeNav () { overlay.classList.remove('open'); document.body.classList.remove('nav-open'); }
  if (toggle && overlay) {
    toggle.addEventListener('click', openNav);
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeNav);
  }
  if (overlay) {
    overlay.querySelectorAll('.nav-overlay-links a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  // Active nav link
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .nav-overlay-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
  // If the active page lives inside the "More" dropdown, keep its toggle
  // highlighted too so a visitor can see where they are at a glance.
  document.querySelectorAll('.nav-has-dropdown').forEach(function (item) {
    if (item.querySelector('.nav-dropdown-menu a.active')) {
      item.querySelector('.nav-dropdown-toggle').classList.add('active');
    }
  });

  // "More" nav dropdown — hover works via CSS alone; this layer adds
  // click/tap and keyboard support, and closes on outside click or Escape.
  document.querySelectorAll('.nav-has-dropdown').forEach(function (item) {
    var toggleBtn = item.querySelector('.nav-dropdown-toggle');
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !item.classList.contains('is-open');
      document.querySelectorAll('.nav-has-dropdown.is-open').forEach(function (open) {
        if (open !== item) { open.classList.remove('is-open'); open.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false'); }
      });
      item.classList.toggle('is-open', willOpen);
      toggleBtn.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-has-dropdown.is-open').forEach(function (open) {
      open.classList.remove('is-open');
      open.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-has-dropdown.is-open').forEach(function (open) {
        open.classList.remove('is-open');
        open.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Back to top
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Slide-in reveal for detail blocks (Services page) — replays every time
  // a block scrolls into view, not just once.
  var detailBlocks = document.querySelectorAll('.detail-block');
  if (detailBlocks.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.2 });
    detailBlocks.forEach(function (block) { observer.observe(block); });
  } else {
    detailBlocks.forEach(function (block) { block.classList.add('is-visible'); });
  }

  // Staggered slide-in for highlighted bullets (Home page — Why It Matters to
  // Us; About page — Company Specializations numbered list)
  var highlightItems = document.querySelectorAll('.highlight-list li, .policy-list.is-numbered li');
  if (highlightItems.length && 'IntersectionObserver' in window) {
    var hlObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          hlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    highlightItems.forEach(function (li, i) {
      li.style.transitionDelay = (i * 100) + 'ms';
      hlObserver.observe(li);
    });
  } else {
    highlightItems.forEach(function (li) { li.classList.add('is-visible'); });
  }

  // Why It Matters — scroll-triggered reveals (title words slide in from the
  // left, image wipes in, floating card fades up), mirroring the Bustar
  // "home-4" section this panel is modelled on.
  var splitTargets = document.querySelectorAll('.split-words');
  splitTargets.forEach(function (el) {
    if (el.dataset.split === 'done') return;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'split-word';
      span.textContent = word;
      span.style.transitionDelay = (i * 20) + 'ms';
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.split = 'done';
  });

  // Plain scroll-position check rather than IntersectionObserver: the observer
  // silently never fires in some contexts (e.g. a tab loaded in the
  // background), which would leave these elements clipped/faded to invisible.
  var revealTargets = [].slice.call(
    document.querySelectorAll(
      '.split-words, .diligence-panel, .diligence-features, ' +
      '.diligence-media-reveal, .diligence-floating-card, .metals-reveal, .whatwedo-card, ' +
      '.reveal-fade'
    )
  );
  if (revealTargets.length) {
    // Arm the hidden starting states only now that we know we can undo them.
    document.documentElement.classList.add('js-anim');
    var revealTicking = false;
    function checkReveals () {
      revealTicking = false;
      revealTargets = revealTargets.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
          el.classList.add('is-visible');
          return false;
        }
        return true;
      });
      if (!revealTargets.length) {
        window.removeEventListener('scroll', onRevealScroll);
        window.removeEventListener('resize', checkReveals);
      }
    }
    function onRevealScroll () {
      if (revealTicking) return;
      revealTicking = true;
      window.requestAnimationFrame(checkReveals);
    }
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', checkReveals);
    window.addEventListener('load', checkReveals);
    checkReveals();
    // Last-resort backstop: never leave anything stranded invisible.
    setTimeout(function () {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      revealTargets = [];
    }, 2000);
  }

  // Hero slider — tile transition (Home page)
  var slider = document.getElementById('heroSlider');
  var slideBg = document.getElementById('heroSlideBg');
  var tilesWrap = document.getElementById('heroTiles');
  if (slider && slideBg && tilesWrap) {
    var heroImages = ['images/banner.png', 'images/banner-1.jpg'];
    var heroCurrent = 0;
    var cols = 8, rows = 5;
    var tiles = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var tile = document.createElement('div');
        tile.className = 'hero-tile';
        tile.style.left = (c / cols * 100) + '%';
        tile.style.top = (r / rows * 100) + '%';
        tile.style.width = (100 / cols) + '%';
        tile.style.height = (100 / rows) + '%';
        tilesWrap.appendChild(tile);
        tiles.push(tile);
      }
    }
    function shuffledOrder() {
      var order = tiles.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      return order;
    }
    function coverTiles(callback) {
      var order = shuffledOrder();
      order.forEach(function (tileIndex, seq) {
        tiles[tileIndex].style.transitionDelay = (seq * 10) + 'ms';
        tiles[tileIndex].classList.add('cover');
      });
      setTimeout(callback, tiles.length * 10 + 450);
    }
    function revealTiles() {
      var order = shuffledOrder();
      order.forEach(function (tileIndex, seq) {
        tiles[tileIndex].style.transitionDelay = (seq * 10) + 'ms';
        tiles[tileIndex].classList.remove('cover');
      });
    }
    function nextHeroSlide() {
      coverTiles(function () {
        heroCurrent = (heroCurrent + 1) % heroImages.length;
        slideBg.style.backgroundImage = "url('" + heroImages[heroCurrent] + "')";
        revealTiles();
      });
    }
    setInterval(nextHeroSlide, 5500);
  }

  /* ------------------------------------------------------------------
     ENQUIRY FORMS  —  home page + contact page
     ------------------------------------------------------------------
     GOING LIVE: paste your form endpoint into ENQUIRY_ENDPOINT below and
     both forms post straight to the company inbox. Nothing else to change.

       Web3Forms  https://web3forms.com   free, no account needed.
                  Endpoint: https://api.web3forms.com/submit
                  Then put your key in ENQUIRY_ACCESS_KEY.
       Formspree  https://formspree.io
                  Endpoint: https://formspree.io/f/YOUR_ID
                  Leave ENQUIRY_ACCESS_KEY empty.

     While ENQUIRY_ENDPOINT is empty the forms fall back to opening the
     visitor's mail client pre-filled, so no enquiry is ever lost.
     ------------------------------------------------------------------ */
  var ENQUIRY_ENDPOINT = '';
  var ENQUIRY_ACCESS_KEY = '';
  var ENQUIRY_EMAIL = 'info@synergydiagold.com';

  var enquiryForms = document.querySelectorAll('.js-enquiry-form');
  enquiryForms.forEach(function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');

    function say (msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('is-error', !!isError);
    }

    function asText (data) {
      var lines = [];
      data.forEach(function (value, key) {
        if (key.charAt(0) !== '_' && String(value).trim()) lines.push(key + ': ' + value);
      });
      return lines.join('\n');
    }

    function viaMailClient (data) {
      var subject = (data.get('subject') || '').trim() || 'Enquiry from synergydiagold.com';
      window.location.href = 'mailto:' + ENQUIRY_EMAIL
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(asText(data));
      say('Opening your email app — press send to deliver your enquiry.');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        say('Please complete the required fields.', true);
        return;
      }

      var data = new FormData(form);
      if (!ENQUIRY_ENDPOINT) { viaMailClient(data); return; }

      if (ENQUIRY_ACCESS_KEY) data.append('access_key', ENQUIRY_ACCESS_KEY);
      data.append('subject', (data.get('subject') || '').trim() || 'Enquiry from synergydiagold.com');

      if (button) { button.disabled = true; }
      say('Sending…');

      fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed: ' + res.status);
          form.reset();
          say('Thank you — your enquiry has been sent. We will be in touch shortly.');
        })
        .catch(function () {
          // Never lose the enquiry: hand it to the mail client instead.
          say('We could not send that automatically — opening your email app instead.', true);
          viaMailClient(data);
        })
        .then(function () {
          if (button) { button.disabled = false; }
        });
    });
  });

  // Why It Matters — the photo band drifts against the scroll for depth.
  var band = document.querySelector('.values-photo-band');
  if (band && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var bandTicking = false;
    function moveBand () {
      bandTicking = false;
      var r = band.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      // 0 as the band enters the viewport, 1 as it leaves
      var progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      band.style.backgroundPosition = 'center calc(50% + ' + ((progress - 0.5) * 70).toFixed(1) + 'px)';
    }
    window.addEventListener('scroll', function () {
      if (bandTicking) return;
      bandTicking = true;
      window.requestAnimationFrame(moveBand);
    }, { passive: true });
    window.addEventListener('resize', moveBand);
    moveBand();
  }

  // What We Trade — expanding metal panels (Home page)
  var metalsPanel = document.getElementById('metalsPanel');
  if (metalsPanel) {
    var metalPanels = metalsPanel.querySelectorAll('.metal-panel');
    var openMetal = function (panel) {
      metalPanels.forEach(function (p) { p.classList.toggle('is-active', p === panel); });
    };
    metalPanels.forEach(function (panel) {
      panel.addEventListener('mouseenter', function () { openMetal(panel); });
      // Hover alone leaves this dead on touch screens, so honour taps too.
      panel.addEventListener('click', function () { openMetal(panel); });
      panel.addEventListener('focus', function () { openMetal(panel); });
    });
  }

  /* ==================================================================
     CINEMATIC INTERACTION LAYER
     ------------------------------------------------------------------
     Everything below is additive polish — magnetic buttons, card tilt,
     a toast for form confirmations, an image shimmer, hero atmosphere,
     and a softened page transition. All of it is gated on the same
     reduced-motion check, and none of it is required for any page to
     read or work correctly with JS disabled.
     ================================================================== */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFine = window.matchMedia('(pointer: fine)').matches;

  if (!reducedMotion && pointerFine) {
    // ---- Magnetic buttons: pulls toward the cursor within a small radius ----
    var MAGNET_RADIUS = 70;
    var MAGNET_STRENGTH = 0.28;
    document.querySelectorAll('.btn, .cta-arrow').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        var dist = Math.sqrt(mx * mx + my * my);
        if (dist > MAGNET_RADIUS) return;
        btn.style.transform = 'translate(' + (mx * MAGNET_STRENGTH).toFixed(1) + 'px,' + (my * MAGNET_STRENGTH).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    // ---- 3D tilt on product cards — "catching the light" ----
    document.querySelectorAll('.product-card').forEach(function (card) {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0 -> 1 across the card
        var py = (e.clientY - r.top) / r.height;
        var tiltY = (px - 0.5) * 14;   // left/right cursor position -> Y rotation
        var tiltX = (0.5 - py) * 14;   // up/down cursor position -> X rotation
        card.style.setProperty('--tiltX', tiltX.toFixed(2) + 'deg');
        card.style.setProperty('--tiltY', tiltY.toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--tiltX', '0deg');
        card.style.setProperty('--tiltY', '0deg');
      });
    });

    // ---- Hero: cursor-following gold glow (home page only, sparing use) ----
    var heroSliderEl = document.getElementById('heroSlider');
    if (heroSliderEl) {
      var glow = document.createElement('div');
      glow.className = 'hero-glow';
      heroSliderEl.appendChild(glow);
      heroSliderEl.addEventListener('mouseenter', function () { glow.classList.add('is-active'); });
      heroSliderEl.addEventListener('mouseleave', function () { glow.classList.remove('is-active'); });
      heroSliderEl.addEventListener('mousemove', function (e) {
        var r = heroSliderEl.getBoundingClientRect();
        glow.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        glow.style.setProperty('--gy', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      });
    }
  }

  // ---- Hero: faint drifting gold dust (home page only, sparing use) ----
  // Built the same way the existing hero-tile grid already is: generated at
  // runtime, so a page with JS disabled shows exactly today's hero, nothing missing.
  if (!reducedMotion) {
    var heroForDust = document.getElementById('heroSlider');
    if (heroForDust) {
      var dust = document.createElement('div');
      dust.className = 'hero-particles';
      var DUST_COUNT = 10;
      for (var d = 0; d < DUST_COUNT; d++) {
        var speck = document.createElement('span');
        speck.className = 'hero-particle';
        speck.style.left = (Math.random() * 100).toFixed(1) + '%';
        speck.style.top = (40 + Math.random() * 55).toFixed(1) + '%';
        speck.style.setProperty('--size', (2 + Math.random() * 3).toFixed(1) + 'px');
        speck.style.setProperty('--dur', (10 + Math.random() * 10).toFixed(1) + 's');
        speck.style.setProperty('--delay', (Math.random() * -20).toFixed(1) + 's');
        speck.style.setProperty('--driftX', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
        speck.style.setProperty('--driftY', (-40 - Math.random() * 60).toFixed(0) + 'px');
        speck.style.setProperty('--peak', (0.2 + Math.random() * 0.25).toFixed(2));
        dust.appendChild(speck);
      }
      heroForDust.insertBefore(dust, heroForDust.querySelector('.hero-inner'));
    }
  }

  // ---- Image loading shimmer (generic, skips the logo everywhere it appears) ----
  document.querySelectorAll('img').forEach(function (img) {
    if (img.closest('.nav-brand, .footer-brand, .nav-overlay')) return;
    if (img.complete && img.naturalWidth > 0) return;
    img.classList.add('img-shimmer');
    img.addEventListener('load', function () { img.classList.remove('img-shimmer'); }, { once: true });
    img.addEventListener('error', function () { img.classList.remove('img-shimmer'); }, { once: true });
  });

  // ---- Toast notifications for form confirmations ----
  var toastStack = document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);
  window.showToast = function (message, isError) {
    var toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' is-error' : '');
    var icon = isError
      ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    toast.innerHTML = icon + '<span></span>';
    toast.querySelector('span').textContent = message;
    toastStack.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, 4200);
  };
  // Hook the toast into the enquiry forms' existing status line — additive,
  // the inline status text (and its no-JS-required paths) is untouched.
  document.querySelectorAll('.js-enquiry-form .form-status').forEach(function (status) {
    var seen = '';
    new MutationObserver(function () {
      var text = status.textContent;
      if (text && text !== seen) {
        seen = text;
        window.showToast(text, status.classList.contains('is-error'));
      }
    }).observe(status, { childList: true, characterData: true, subtree: true });
  });

  // ---- Accordion (Account Opening — required documentation) ----
  document.querySelectorAll('.accordion').forEach(function (acc) {
    var items = acc.querySelectorAll('.accordion-item');
    items.forEach(function (item) {
      var header = item.querySelector('.accordion-header');
      header.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  // ---- Footer newsletter form — no backend, so just confirm via toast ----
  document.querySelectorAll('.js-newsletter-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      window.showToast('Thanks for subscribing — you\'re on the list.');
      form.reset();
    });
  });

  // ---- Softened page transition: fade out before a normal same-site navigation ----
  // Safety: if the browser restores this exact page from back/forward cache
  // after a fade-out was triggered, the class must not survive the restore —
  // otherwise the page would come back permanently invisible.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('page-fade-out');
  });
  if (!reducedMotion) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
      if (a.origin !== window.location.origin) return;
      // Same-page link (identical path, only the hash differs) — let the
      // browser's own smooth scroll handle it, no fade needed.
      if (a.pathname === window.location.pathname && a.hash) return;
      e.preventDefault();
      document.body.classList.add('page-fade-out');
      setTimeout(function () { window.location.href = href; }, 200);
    });
  }
})();
