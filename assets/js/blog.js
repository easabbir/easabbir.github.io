// /blog/ index: topic filter + search. Shared behaviour (theme, menu, copy)
// lives in site.js.
(function () {
    'use strict';

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
        var query = (search.value || '').trim().toLowerCase();
        var terms = query ? query.split(/\s+/) : [];
        var shown = 0;

        cards.forEach(function (card) {
            var inCategory = current === 'all' || card.getAttribute('data-category') === current;
            var haystack = card.getAttribute('data-search');
            var matches = terms.every(function (term) { return haystack.indexOf(term) !== -1; });
            card.hidden = !(inCategory && matches);
            if (!card.hidden) shown++;
        });

        series.forEach(function (block) {
            block.hidden = !!query || (current !== 'all' && block.getAttribute('data-category') !== current);
        });

        chips.forEach(function (chip) {
            var on = chip.getAttribute('data-filter') === current;
            chip.classList.toggle('active', on);
            chip.setAttribute('aria-pressed', String(on));
        });

        countEl.textContent = shown === cards.length
            ? cards.length + ' articles'
            : shown + ' of ' + cards.length + ' articles';
        emptyEl.hidden = shown !== 0;
    }

    function setCategory(category, updateUrl) {
        var valid = chips.some(function (chip) { return chip.getAttribute('data-filter') === category; });
        current = valid ? category : 'all';
        if (updateUrl) {
            history.replaceState(null, '', current === 'all' ? location.pathname + location.search : '#' + current);
        }
        apply();
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () { setCategory(chip.getAttribute('data-filter'), true); });
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
