(() => {
  const HIGHLIGHT_CLASS = "kbnav-selected";

  // Google changes its internal class names periodically; try several known
  // result containers and validate that each candidate wraps a title and link.
  const CONTAINER_SELECTORS = [".MjjYud", ".g", ".tF2Cxc", ".hlcw0c", ".Ww4FFb"];

  let results: HTMLElement[] = [];
  let currentIndex = -1;

  function isVisible(element: HTMLElement): boolean {
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  function findResults(): HTMLElement[] {
    const found: HTMLElement[] = [];
    const candidates = document.querySelectorAll<HTMLElement>(CONTAINER_SELECTORS.join(","));

    candidates.forEach((element) => {
      const heading = element.querySelector("h3");
      const link = element.querySelector("a[href]");
      if (!heading || !link || !isVisible(element)) return;

      // Different selectors can match overlapping containers. Keep only one.
      for (let index = 0; index < found.length; index += 1) {
        const other = found[index];
        if (!other) continue;
        if (other.contains(element)) return;
        if (element.contains(other)) {
          found[index] = element;
          return;
        }
      }

      found.push(element);
    });

    found.sort(
      (first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top,
    );
    return found;
  }

  function clearHighlight(): void {
    if (currentIndex >= 0) {
      results[currentIndex]?.classList.remove(HIGHLIGHT_CLASS);
    }
  }

  function highlight(index: number): void {
    if (results.length === 0) return;

    clearHighlight();
    currentIndex = Math.max(0, Math.min(index, results.length - 1));

    const element = results[currentIndex];
    if (!element) return;
    element.classList.add(HIGHLIGHT_CLASS);
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function getLinkFor(element: HTMLElement): HTMLAnchorElement | null {
    return element.querySelector<HTMLAnchorElement>("a[href]");
  }

  function openCurrent(newTab: boolean): void {
    if (currentIndex < 0) return;

    const result = results[currentIndex];
    if (!result) return;

    const link = getLinkFor(result);
    if (!link?.href) return;

    if (newTab) {
      window.open(link.href, "_blank", "noopener");
    } else {
      window.location.assign(link.href);
    }
  }

  function refresh(): void {
    const previousElement = results[currentIndex];
    results = findResults();
    currentIndex = previousElement ? results.indexOf(previousElement) : -1;
  }

  function isTypingTarget(target: EventTarget | null): target is HTMLElement {
    if (!(target instanceof HTMLElement)) return false;

    const tag = target.tagName;
    return (
      target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
    );
  }

  function focusSearchBox(): void {
    const searchBox = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input[name="q"], textarea[name="q"]',
    );

    if (searchBox) {
      searchBox.focus();
      searchBox.select();
    }
  }

  function toggleHelp(): void {
    const existing = document.getElementById("kbnav-help");
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement("div");
    panel.id = "kbnav-help";
    panel.innerHTML =
      "<strong>Keyboard Search Nav</strong>" +
      "<ul>" +
      "<li><span>Next result</span><kbd>j</kbd> / <kbd>s</kbd></li>" +
      "<li><span>Previous result</span><kbd>k</kbd> / <kbd>a</kbd></li>" +
      "<li><span>Open result</span><kbd>Enter</kbd></li>" +
      "<li><span>Open in new tab</span><kbd>o</kbd></li>" +
      "<li><span>Jump to result</span><kbd>1-9</kbd></li>" +
      "<li><span>Focus search box</span><kbd>/</kbd></li>" +
      "<li><span>Clear selection</span><kbd>Esc</kbd></li>" +
      "<li><span>Toggle this help</span><kbd>?</kbd></li>" +
      "</ul>";
    document.body.appendChild(panel);
  }

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isTypingTarget(event.target)) {
      if (event.key === "Escape") event.target.blur();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    refresh();

    switch (event.key) {
      case "j":
      case "s":
      case "ArrowDown":
        event.preventDefault();
        highlight(currentIndex + 1);
        break;
      case "k":
      case "a":
      case "ArrowUp":
        event.preventDefault();
        highlight(currentIndex - 1);
        break;
      case "Enter":
        event.preventDefault();
        openCurrent(false);
        break;
      case "o":
      case "O":
        event.preventDefault();
        openCurrent(true);
        break;
      case "/":
        event.preventDefault();
        focusSearchBox();
        break;
      case "?":
        event.preventDefault();
        toggleHelp();
        break;
      case "Escape":
        clearHighlight();
        currentIndex = -1;
        break;
      default:
        if (/^[1-9]$/.test(event.key)) {
          event.preventDefault();
          highlight(Number.parseInt(event.key, 10) - 1);
        }
    }
  });

  // Google can update results without a full page navigation.
  refresh();
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });
})();
