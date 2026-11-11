// Blog pages: theme toggle, mobile menu, topic filter + search, copy-link.
(function () {
    'use strict';

    // Theme (shares the 'theme' key with the home page)
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
        var icon = toggle.querySelector('i');
        var setIcon = function (theme) { icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; };
        setIcon(document.documentElement.getAttribute('data-theme'));
        toggle.addEventListener('click', function () {
            var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            setIcon(next);
        });
    }

    // Mobile menu
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('.nav-menu');
    if (hamburger && menu) {
        hamburger.addEventListener('click', function () {
            var open = menu.classList.toggle('active');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });
    }

    // Copy link
    document.querySelectorAll('.copy-link').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var done = function () {
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(function () { btn.classList.remove('copied'); btn.innerHTML = '<i class="fas fa-link"></i>'; }, 1800);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.url).then(done, function () {});
        });
    });

    // Topic filter + search (blog index only)
    var grid = document.getElementById('post-grid');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
    var series = Array.prototype.slice.call(document.querySelectorAll('.series-feature'));
    var search = document.getElementById('post-search');
    var countEl = document.getElementById('result-count');
    var emptyEl = document.getElementById('blog-empty');
    var current = 'all';

    function apply() {
        var q = (search.value || '').trim().toLowerCase();
        var terms = q ? q.split(/\s+/) : [];
        var shown = 0;
        cards.forEach(function (card) {
            var okCat = current === 'all' || card.dataset.category === current;
            var hay = card.dataset.search;
            var okText = terms.every(function (t) { return hay.indexOf(t) !== -1; });
            var show = okCat && okText;
            card.hidden = !show;
            if (show) shown++;
        });
        series.forEach(function (s) {
            s.hidden = !!q || (current !== 'all' && s.dataset.category !== current);
        });
        chips.forEach(function (c) {
            var on = c.dataset.filter === current;
            c.classList.toggle('active', on);
            c.setAttribute('aria-pressed', String(on));
        });
        countEl.textContent = shown === cards.length ? cards.length + ' articles' : shown + ' of ' + cards.length + ' articles';
        emptyEl.hidden = shown !== 0;
    }

    function setCategory(cat, push) {
        var valid = chips.some(function (c) { return c.dataset.filter === cat; });
        current = valid ? cat : 'all';
        if (push) {
            var url = current === 'all' ? location.pathname + location.search : '#' + current;
            history.replaceState(null, '', url);
        }
        apply();
    }

    chips.forEach(function (c) {
        c.addEventListener('click', function () { setCategory(c.dataset.filter, true); });
    });
    search.addEventListener('input', apply);
    document.getElementById('clear-filters').addEventListener('click', function () {
        search.value = '';
        setCategory('all', true);
        search.focus();
    });
    window.addEventListener('hashchange', function () { setCategory(location.hash.slice(1), false); });

    setCategory(location.hash.slice(1) || 'all', false);
})();
