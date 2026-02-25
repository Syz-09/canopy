/* CANOPY — Nav, smooth scroll, tabs, form success */

(function () {
  'use strict';

  // ——— Mobile nav toggle ———
  var nav = document.querySelector('.site-nav');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', links.classList.contains('is-open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ——— Smooth scroll for anchor links (same page) ———
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var href = anchor.getAttribute('href');
    if (href === '#') return;
    var id = href.slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    anchor.addEventListener('click', function (e) {
      if (target.closest('.submit-panel') && document.body.classList.contains('submit-page')) {
        // On submit page: switch tab then scroll
        var panel = target.closest('.submit-panel');
        if (panel) {
          var panelId = panel.id;
          switchTab(panelId);
        }
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ——— Submit page: tabs + hash ———
  function switchTab(panelId) {
    var tabs = document.querySelectorAll('.submit-tabs a[data-panel]');
    var panels = document.querySelectorAll('.submit-panel');
    if (!tabs.length || !panels.length) return;
    tabs.forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-panel') === panelId);
      t.setAttribute('aria-selected', t.getAttribute('data-panel') === panelId ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.id === panelId);
    });
    if (history.replaceState) {
      history.replaceState(null, '', '#' + panelId);
    }
  }

  var submitTabs = document.querySelector('.submit-tabs');
  if (submitTabs && document.body.classList.contains('submit-page')) {
    submitTabs.querySelectorAll('a[data-panel]').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(tab.getAttribute('data-panel'));
      });
    });
    // On load, open tab from hash
    var hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      switchTab(hash);
    }
    window.addEventListener('hashchange', function () {
      var h = window.location.hash.slice(1);
      if (h && document.getElementById(h)) switchTab(h);
    });
  }

  // ——— Forms: prevent default, show success ———
  document.querySelectorAll('.submit-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (form.getAttribute('data-form') === 'contributor') {
        var roles = form.querySelectorAll('input[name="role"]:checked');
        if (roles.length === 0) {
          e.preventDefault();
          var first = form.querySelector('input[name="role"]');
          if (first) { first.focus(); first.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
          return;
        }
      }
      e.preventDefault();
      var name = form.getAttribute('data-form');
      var successEl = document.getElementById(name + '-success');
      if (successEl) {
        successEl.classList.add('is-visible');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // ——— Newsletter forms (no backend): prevent default, optional message ———
  document.querySelectorAll('.newsletter-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (email && email.value.trim()) {
        // Placeholder: in production, post to Mailchimp/Substack/ConvertKit
        var msg = form.querySelector('.newsletter-success') || (function () {
          var m = document.createElement('p');
          m.className = 'newsletter-success';
          m.style.cssText = 'margin-top: 0.5rem; font-size: 0.9rem; color: var(--color-text-muted);';
          form.appendChild(m);
          return m;
        })();
        msg.textContent = 'Thanks. You’re on the list.';
      }
    });
  });

  // ——— Scroll reveal: add .is-visible when element enters viewport ———
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
