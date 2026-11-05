(function () {
  "use strict";

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  ready(() => {
    const shell = document.querySelector("[data-sunday-shell]");
    const header = document.querySelector("[data-sunday-header]");
    if (!shell || !header) return;

    const menuButtons = Array.from(shell.querySelectorAll("[data-sunday-menu]"));
    const megaPanels = Array.from(shell.querySelectorAll("[data-sunday-mega]"));
    const overlayPanels = Array.from(shell.querySelectorAll("[data-sunday-panel]"));
    const backdrop = shell.querySelector("[data-sunday-backdrop]");
    const searchInput = shell.querySelector("[data-sunday-search-input]");
    const searchForm = shell.querySelector("[data-sunday-search-form]");
    const searchResults = shell.querySelector("[data-sunday-search-results]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let products = [];
let productsRequest = null;

const loadProducts = () => {
  if (!productsRequest) productsRequest = fetch('/catalog.json').then(r => r.json()).then(data => (products = data));
  return productsRequest;
};
    let openMega = null;
    let openPanel = null;
    let lastTrigger = null;
    let openTimer = null;
    let closeTimer = null;
    let lastScrollY = window.scrollY;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 72);
    };

    const closeMegaMenu = (restoreFocus) => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      menuButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
      megaPanels.forEach((panel) => {
        panel.classList.remove("is-open");
        window.setTimeout(() => {
          if (!panel.classList.contains("is-open")) panel.hidden = true;
        }, reducedMotion ? 0 : 220);
      });
      if (restoreFocus && openMega) {
        const button = shell.querySelector(`[data-sunday-menu="${openMega}"]`);
        if (button) button.focus();
      }
      openMega = null;
    };

    const openMegaMenu = (name) => {
      if (window.innerWidth <= 900 || openPanel) return;
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      megaPanels.forEach((panel) => {
        const active = panel.dataset.sundayMega === name;
        panel.hidden = !active;
        panel.classList.toggle("is-open", active);
      });
      menuButtons.forEach((button) => {
        button.setAttribute("aria-expanded", button.dataset.sundayMenu === name ? "true" : "false");
      });
      openMega = name;
    };

    const scheduleMegaOpen = (name) => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => openMegaMenu(name), 120);
    };

    const scheduleMegaClose = () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => closeMegaMenu(false), 260);
    };

    menuButtons.forEach((button) => {
      const name = button.dataset.sundayMenu;
      button.addEventListener("mouseenter", () => scheduleMegaOpen(name));
      button.addEventListener("focus", () => scheduleMegaOpen(name));
      button.addEventListener("mouseleave", scheduleMegaClose);
      button.addEventListener("click", () => {
        if (button.matches("a[href]")) return;
        if (openMega === name) closeMegaMenu(false);
        else openMegaMenu(name);
      });
    });

    megaPanels.forEach((panel) => {
      panel.addEventListener("mouseenter", () => window.clearTimeout(closeTimer));
      panel.addEventListener("mouseleave", scheduleMegaClose);
      panel.addEventListener("focusin", () => window.clearTimeout(closeTimer));
      panel.addEventListener("focusout", (event) => {
        if (!panel.contains(event.relatedTarget)) scheduleMegaClose();
      });
    });

    const normalizeSearch = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    const suggestedProductNames = ["RT", "TRZ", "KLOW", "GLOW"];
    let lastSearchMatches = [];

    const getSearchMatches = (query) => {
      const normalized = normalizeSearch(query);
      if (normalized) {
        return products
          .filter((product) => normalizeSearch(product.name).includes(normalized))
          .slice(0, 4);
      }

      const preferred = suggestedProductNames
        .map((name) => products.find((product) => normalizeSearch(product.name) === normalizeSearch(name)))
        .filter(Boolean);
      const remaining = products.filter((product) => !preferred.includes(product));
      return [...preferred, ...remaining].slice(0, 4);
    };

    const renderSearch = async (query) => {
      if (!searchResults) return;

      await loadProducts();
      const normalized = normalizeSearch(query);
      const matches = getSearchMatches(query);
      lastSearchMatches = matches;
      searchResults.replaceChildren();

      const heading = document.createElement("h2");
      heading.className = "sunday-search-results-title";
      heading.textContent = normalized ? "Search results" : "Suggested products";
      searchResults.append(heading);

      if (!matches.length) {
        const empty = document.createElement("p");
        empty.className = "sunday-search-empty";
        empty.textContent = "No materials match that search yet.";
        searchResults.append(empty);
        return;
      }

      matches.forEach((product) => {
        const link = document.createElement("a");
        const image = document.createElement("img");
        const name = document.createElement("strong");
        const price = document.createElement("span");
        const meta = document.createElement("span");
        link.className = "sunday-search-result";
        link.dataset.sundaySearchResult = "";
        link.href = product.url;
        image.src = product.image;
        image.alt = "";
        image.loading = "lazy";
        name.textContent = product.name;
        price.className = "sunday-search-result__price";
        price.innerHTML = product.priceHtml || product.price;
        meta.className = "sunday-search-result__meta";
        meta.append(name, price);
        link.append(image, meta);
        searchResults.append(link);
      });
    };

    const showBackdrop = () => {
      if (!backdrop) return;
      backdrop.hidden = false;
      window.requestAnimationFrame(() => backdrop.classList.add("is-open"));
    };

    const hideBackdrop = () => {
      if (!backdrop) return;
      backdrop.classList.remove("is-open");
      window.setTimeout(() => {
        if (!backdrop.classList.contains("is-open")) backdrop.hidden = true;
      }, reducedMotion ? 0 : 260);
    };

    const closeOverlay = (restoreFocus) => {
      if (!openPanel) return;
      const panel = shell.querySelector(`[data-sunday-panel="${openPanel}"]`);
      if (panel) {
        panel.classList.remove("is-open");
        window.setTimeout(() => {
          if (!panel.classList.contains("is-open")) panel.hidden = true;
        }, reducedMotion ? 0 : 330);
      }
      shell.querySelectorAll("[data-sunday-open]").forEach((button) => {
        if (button.hasAttribute("aria-expanded")) button.setAttribute("aria-expanded", "false");
      });
      document.body.classList.remove("sunday-overlay-open");
      hideBackdrop();
      openPanel = null;
      if (restoreFocus && lastTrigger) lastTrigger.focus();
    };

    const openOverlay = (name, trigger) => {
      const panel = shell.querySelector(`[data-sunday-panel="${name}"]`);
      if (!panel) return;
      closeMegaMenu(false);
      if (openPanel && openPanel !== name) closeOverlay(false);
      openPanel = name;
      lastTrigger = trigger;
      panel.hidden = false;
      document.body.classList.add("sunday-overlay-open");
      if (name === "search") {
        panel.style.setProperty("--sunday-search-top", `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
        hideBackdrop();
      } else {
        showBackdrop();
      }
      if (trigger.hasAttribute("aria-expanded")) trigger.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(() => {
        panel.classList.add("is-open");
        const focusTarget = name === "search" ? searchInput : panel.querySelector(focusableSelector);
        if (focusTarget) focusTarget.focus();
      });
      if (name === "search") void renderSearch("");
    };

    shell.querySelectorAll("[data-sunday-open]").forEach((trigger) => {
      trigger.addEventListener("click", () => openOverlay(trigger.dataset.sundayOpen, trigger));
    });

    shell.querySelectorAll("[data-sunday-close]").forEach((button) => {
      button.addEventListener("click", () => closeOverlay(true));
    });

    if (backdrop) backdrop.addEventListener("click", () => closeOverlay(true));
    const searchPanel = shell.querySelector('[data-sunday-panel="search"]');
    if (searchPanel) {
      searchPanel.addEventListener("click", (event) => {
        if (event.target === searchPanel) closeOverlay(true);
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", () => void renderSearch(searchInput.value));
    }
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const firstMatch = lastSearchMatches[0];
        if (firstMatch?.url) window.location.assign(firstMatch.url);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (openPanel) closeOverlay(true);
        else if (openMega) closeMegaMenu(true);
        return;
      }

      if (event.key !== "Tab" || !openPanel) return;
      const panel = shell.querySelector(`[data-sunday-panel="${openPanel}"]`);
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll(focusableSelector)).filter((element) => !element.hidden && element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!openMega) return;
      const activePanel = shell.querySelector(`[data-sunday-mega="${openMega}"]`);
      const activeButton = shell.querySelector(`[data-sunday-menu="${openMega}"]`);
      if (!activePanel.contains(event.target) && !activeButton.contains(event.target)) closeMegaMenu(false);
    });

    updateHeader();
    window.addEventListener("scroll", () => {
      updateHeader();
      if (openMega && Math.abs(window.scrollY - lastScrollY) > 8) closeMegaMenu(false);
      lastScrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 900 && openMega) closeMegaMenu(false);
      if (openPanel === "search") {
        const panel = shell.querySelector('[data-sunday-panel="search"]');
        panel?.style.setProperty("--sunday-search-top", `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
      }
    });


  });
})();
