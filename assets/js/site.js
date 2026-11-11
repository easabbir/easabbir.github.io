// Shared behaviour for every page: theme, navigation, scroll effects,
// copy buttons, testimonial expanders and the contact form.
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var liveRegion = document.getElementById('live-region');

    function announce(message) {
        if (!liveRegion) return;
        liveRegion.textContent = '';
        window.setTimeout(function () { liveRegion.textContent = message; }, 50);
    }

    function forEach(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    /* ---------- Theme ---------- */
    var themeToggle = document.getElementById('theme-toggle');

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function syncThemeToggle() {
        if (!themeToggle) return;
        var dark = currentTheme() === 'dark';
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    function savedTheme() {
        try { return localStorage.getItem('theme'); } catch (e) { return null; }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            syncThemeToggle();
        });
    }

    // Follow the OS theme until the visitor picks one explicitly.
    var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemTheme = function (event) {
        var saved = savedTheme();
        if (saved === 'light' || saved === 'dark') return;
        root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
        syncThemeToggle();
    };
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemTheme);
    else if (darkQuery.addListener) darkQuery.addListener(onSystemTheme);
    syncThemeToggle();

    /* ---------- Mobile menu ---------- */
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');

    function setMenu(open) {
        if (!navToggle || !navMenu) return;
        navMenu.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            setMenu(!navMenu.classList.contains('is-open'));
        });
        navMenu.addEventListener('click', function (event) {
            if (event.target.closest('a')) setMenu(false);
        });
        document.addEventListener('click', function (event) {
            if (navMenu.classList.contains('is-open') && !event.target.closest('#nav-menu, #nav-toggle')) setMenu(false);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
                setMenu(false);
                navToggle.focus();
            }
        });
        var desktop = window.matchMedia('(min-width: 961px)');
        var onDesktop = function (event) { if (event.matches) setMenu(false); };
        if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
        else if (desktop.addListener) desktop.addListener(onDesktop);
    }

    /* ---------- Navbar border + back-to-top ---------- */
    var navbar = document.getElementById('navbar');
    var backToTop = document.getElementById('back-to-top');
    var scrollTicking = false;

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (navbar) navbar.classList.toggle('is-scrolled', y > 8);
        if (backToTop) backToTop.classList.toggle('is-visible', y > 900);
        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            var logo = document.querySelector('.nav-logo');
            if (logo) logo.focus({ preventScroll: true });
        });
    }

    /* ---------- Scrollspy (home page) ---------- */
    if (document.body.classList.contains('home') && 'IntersectionObserver' in window) {
        var spyLinks = document.querySelectorAll('.nav-link[data-section]');
        var linkFor = {};
        forEach(spyLinks, function (link) { linkFor[link.getAttribute('data-section')] = link; });

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                forEach(spyLinks, function (link) { link.classList.remove('is-active'); });
                var active = linkFor[entry.target.id];
                if (active) active.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        forEach(document.querySelectorAll('main section[id]'), function (section) { spy.observe(section); });
    }

    /* ---------- Scroll reveal ---------- */
    var revealItems = document.querySelectorAll('[data-reveal]');
    forEach(document.querySelectorAll('[data-reveal-group]'), function (group) {
        forEach(group.querySelectorAll('[data-reveal]'), function (item, index) {
            item.style.setProperty('--reveal-i', Math.min(index, 8));
        });
    });

    function settle(item) {
        item.removeAttribute('data-reveal');
        item.classList.remove('is-visible');
        item.style.removeProperty('--reveal-i');
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        forEach(revealItems, settle);
    } else {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var item = entry.target;
                revealer.unobserve(item);
                item.classList.add('is-visible');
                var done = function (event) {
                    if (event && event.target !== item) return;
                    item.removeEventListener('transitionend', done);
                    settle(item);
                };
                item.addEventListener('transitionend', done);
                window.setTimeout(done, 1600); // fallback if transitionend never fires
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
        forEach(revealItems, function (item) { revealer.observe(item); });
    }

    /* ---------- Spotlight hover on cards ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        forEach(document.querySelectorAll('[data-spotlight]'), function (card) {
            card.addEventListener('pointermove', function (event) {
                var rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
                card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
            });
        });
    }

    /* ---------- Copy buttons ---------- */
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            try {
                document.execCommand('copy') ? resolve() : reject();
            } catch (e) {
                reject(e);
            }
            document.body.removeChild(area);
        });
    }

    forEach(document.querySelectorAll('[data-copy]'), function (button) {
        var icon = button.querySelector('i');
        var iconClass = icon ? icon.className : '';
        button.addEventListener('click', function () {
            copyText(button.getAttribute('data-copy')).then(function () {
                button.classList.add('is-copied');
                if (icon) icon.className = 'fas fa-check';
                announce('Copied to clipboard');
                window.setTimeout(function () {
                    button.classList.remove('is-copied');
                    if (icon) icon.className = iconClass;
                }, 1800);
            }, function () {
                announce('Copy failed. Select the text and copy it manually.');
            });
        });
    });

    /* ---------- Long recommendations: "Read more" ---------- */
    // CSS clamps each quote to 7 lines. A button is added only where text is
    // actually cut off; re-checked after web fonts load and on resize, because
    // both change how many lines a quote needs.
    var quotes = document.querySelectorAll('.testimonial-text');

    function refreshReadMore() {
        forEach(quotes, function (quote, index) {
            var text = quote.querySelector('p');
            var button = quote.nextElementSibling;
            if (!button || !button.classList.contains('read-more')) button = null;
            if (!text || quote.classList.contains('is-expanded')) return;

            var clipped = text.scrollHeight - text.clientHeight > 4;
            if (clipped && !button) {
                quote.id = quote.id || 'recommendation-' + (index + 1);
                button = document.createElement('button');
                button.type = 'button';
                button.className = 'read-more';
                button.textContent = 'Read more';
                button.setAttribute('aria-expanded', 'false');
                button.setAttribute('aria-controls', quote.id);
                button.addEventListener('click', function () {
                    var open = quote.classList.toggle('is-expanded');
                    button.setAttribute('aria-expanded', String(open));
                    button.textContent = open ? 'Show less' : 'Read more';
                });
                quote.insertAdjacentElement('afterend', button);
            } else if (!clipped && button) {
                button.parentNode.removeChild(button);
            }
        });
    }

    if (quotes.length) {
        refreshReadMore();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshReadMore);
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(refreshReadMore, 150);
        });
    }

    /* ---------- Contact form (opens the visitor's email app) ---------- */
    var form = document.getElementById('contact-form');
    if (form) {
        var status = document.getElementById('form-status');
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        var setError = function (field, message) {
            var error = document.getElementById(field.id + '-error');
            if (message) field.setAttribute('aria-invalid', 'true');
            else field.removeAttribute('aria-invalid');
            if (error) error.textContent = message || '';
        };

        form.setAttribute('novalidate', '');

        form.addEventListener('input', function (event) {
            if (event.target.getAttribute('aria-invalid') === 'true') setError(event.target, '');
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var name = form.elements.name;
            var email = form.elements.email;
            var subject = form.elements.subject;
            var message = form.elements.message;

            var checks = [
                [name, name.value.trim() ? '' : 'Please enter your name.'],
                [email, !email.value.trim() ? 'Please enter your email address.'
                    : emailPattern.test(email.value.trim()) ? '' : 'That email address doesn’t look right. Check for typos.'],
                [message, message.value.trim().length >= 10 ? '' : 'Please write a short message (at least 10 characters).']
            ];

            var firstInvalid = null;
            checks.forEach(function (check) {
                setError(check[0], check[1]);
                if (check[1] && !firstInvalid) firstInvalid = check[0];
            });
            if (firstInvalid) {
                status.textContent = '';
                firstInvalid.focus();
                return;
            }

            var to = form.getAttribute('data-mailto');
            var subjectLine = subject.value.trim() || 'Hello from ' + name.value.trim();
            var body = message.value.trim() + '\n\n— ' + name.value.trim() + ' (' + email.value.trim() + ')';
            window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subjectLine) +
                '&body=' + encodeURIComponent(body);
            status.textContent = 'Your email app should now open with the message ready to send. ' +
                'If nothing happened, email ' + to + ' directly; your message is still in the form.';
        });
    }

    /* ---------- 404: show the path that failed ---------- */
    var missingPath = document.getElementById('missing-path');
    if (missingPath) missingPath.textContent = window.location.pathname;
})();
