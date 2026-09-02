(function () {
  'use strict';

  const HIGHLIGHT_CLASS = 'kbnav-selected';
  // Google changes its internal class names periodically; we try several
  // known result-container selectors and validate each candidate actually
  // wraps a title (h3) and a link before trusting it.
  const CONTAINER_SELECTORS = ['.MjjYud', '.g', '.tF2Cxc', '.hlcw0c', '.Ww4FFb'];

  let results = [];
  let currentIndex = -1;

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function findResults() {
    const found = [];
    const candidates = document.querySelectorAll(CONTAINER_SELECTORS.join(','));

    candidates.forEach((el) => {
      const h3 = el.querySelector('h3');
      const link = el.querySelector('a[href]');
      if (!h3 || !link || !isVisible(el)) return;

      // Skip if this element is nested inside (or wraps) one we already kept,
      // since different selectors can match overlapping containers.
      for (let i = 0; i < found.length; i++) {
        const other = found[i];
        if (other.contains(el)) return;
        if (el.contains(other)) {
          found[i] = el;
          return;
        }
      }
      found.push(el);
    });

    found.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return found;
  }

  function clearHighlight() {
    if (currentIndex >= 0 && results[currentIndex]) {
      results[currentIndex].classList.remove(HIGHLIGHT_CLASS);
    }
  }

  function highlight(index) {
    if (!results.length) return;
    clearHighlight();
    currentIndex = Math.max(0, Math.min(index, results.length - 1));
    const el = results[currentIndex];
    el.classList.add(HIGHLIGHT_CLASS);
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function getLinkFor(el) {
    return el.querySelector('a[href]');
  }

  function openCurrent(newTab) {
    if (currentIndex < 0 || !results[currentIndex]) return;
    const link = getLinkFor(results[currentIndex]);
    if (!link || !link.href) return;
    if (newTab) {
      window.open(link.href, '_blank');
    } else {
      window.location.href = link.href;
    }
  }

  function refresh() {
    const prevEl = results[currentIndex];
    results = findResults();
    currentIndex = prevEl ? results.indexOf(prevEl) : -1;
  }

  function isTypingTarget(target) {
    const tag = target.tagName;
    return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function focusSearchBox() {
    const box = document.querySelector('input[name="q"], textarea[name="q"]');
    if (box) {
      box.focus();
      box.select();
    }
  }

  function toggleHelp() {
    const existing = document.getElementById('kbnav-help');
    if (existing) {
      existing.remove();
      return;
    }
    const panel = document.createElement('div');
    panel.id = 'kbnav-help';
    panel.innerHTML =
      '<strong>Keyboard Search Nav</strong>' +
      '<ul>' +
      '<li><span>Next result</span><kbd>j</kbd> / <kbd>s</kbd></li>' +
      '<li><span>Previous result</span><kbd>k</kbd> / <kbd>a</kbd></li>' +
      '<li><span>Open result</span><kbd>Enter</kbd></li>' +
      '<li><span>Open in new tab</span><kbd>o</kbd></li>' +
      '<li><span>Jump to result</span><kbd>1-9</kbd></li>' +
      '<li><span>Focus search box</span><kbd>/</kbd></li>' +
      '<li><span>Clear selection</span><kbd>Esc</kbd></li>' +
      '<li><span>Toggle this help</span><kbd>?</kbd></li>' +
      '</ul>';
    document.body.appendChild(panel);
  }

  document.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    refresh();

    switch (e.key) {
      case 'j':
      case 's':
      case 'ArrowDown':
        e.preventDefault();
        highlight(currentIndex + 1);
        break;
      case 'k':
      case 'a':
      case 'ArrowUp':
        e.preventDefault();
        highlight(currentIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        openCurrent(false);
        break;
      case 'o':
      case 'O':
        e.preventDefault();
        openCurrent(true);
        break;
      case '/':
        e.preventDefault();
        focusSearchBox();
        break;
      case '?':
        e.preventDefault();
        toggleHelp();
        break;
      case 'Escape':
        clearHighlight();
        currentIndex = -1;
        break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          e.preventDefault();
          highlight(parseInt(e.key, 10) - 1);
        }
    }
  });

  // Initial scan, plus a mutation observer since Google can update the
  // results DOM without a full page navigation (e.g. instant results).
  refresh();
  const observer = new MutationObserver(() => {
    // Re-scan container list; keeps currentIndex pointing at the same
    // element if it still exists, drops it otherwise.
    const prevEl = results[currentIndex];
    results = findResults();
    currentIndex = prevEl ? results.indexOf(prevEl) : -1;
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
