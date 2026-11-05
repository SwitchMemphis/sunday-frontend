(function () {
  "use strict";

  const site = window.SundayCommerce || {};
  function setupAccordions(root) {
    root.querySelectorAll("[data-sunday-accordion]").forEach((item) => {
      if (item.dataset.sundayReady) return;
      item.dataset.sundayReady = "true";
      const button = item.querySelector(":scope > h2 button, :scope > h3 button");
      const panel = item.querySelector(":scope > .sunday-commerce-accordion__panel");
      if (!button || !panel) return;

      button.addEventListener("click", () => {
        const opening = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(opening));
        item.classList.toggle("is-open", opening);
        if (opening) {
          panel.hidden = false;
          panel.style.height = "0px";
          requestAnimationFrame(() => {
            panel.style.height = `${panel.scrollHeight}px`;
          });
        } else {
          panel.style.height = `${panel.scrollHeight}px`;
          requestAnimationFrame(() => {
            panel.style.height = "0px";
          });
        }
      });

      panel.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "height") return;
        if (item.classList.contains("is-open")) {
          panel.style.height = "auto";
        } else {
          panel.hidden = true;
        }
      });
    });
  }

  function variationLabel(option) {
    return option.textContent.trim().toUpperCase();
  }

  function normalizedStrength(value) {
    return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
  }

  function purchaseLabel(amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return "Add to Cart";
    return `Add to Cart · ${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numeric)}`;
  }

  function placeAvailability(root) {
    root.querySelectorAll(".sunday-product-summary").forEach((summary) => {
      if (summary.closest(".sunday-product-v4")) return;
      const availability = summary.querySelector(".sunday-product-summary__availability");
      const form = summary.querySelector(".sunday-product-summary__purchase form.cart");
      if (!availability || !form) return;
      const variationButton = form.querySelector(".woocommerce-variation-add-to-cart");
      const submit = form.querySelector(".single_add_to_cart_button");
      const target = variationButton || submit;
      if (target?.parentNode) target.parentNode.insertBefore(availability, target);
    });
  }

  function setupVariationForms(root) {
    root.querySelectorAll("form.variations_form").forEach((form) => {
      if (form.dataset.sundayReady) return;
      form.dataset.sundayReady = "true";
      const selects = [...form.querySelectorAll("table.variations select")];
      const price = document.querySelector("[data-sunday-single-price]");
      const submit = form.querySelector(".single_add_to_cart_button");
      const coa = form.closest(".sunday-product-summary")?.querySelector("[data-sunday-coa]");
      const coaLink = coa?.querySelector("a");
      const mobileCoaLink = form.closest(".sunday-product-summary")?.querySelector("[data-sunday-mobile-coa]");
      const coaCopy = coa?.querySelector("small");
      const availability = form.closest(".sunday-product-summary")?.querySelector(".sunday-product-summary__availability");
      let variations = [];
      try { variations = JSON.parse(form.dataset.product_variations || "[]"); } catch (_error) { variations = []; }
      let coaDocuments = {};
      try { coaDocuments = JSON.parse(coa?.dataset.coaDocuments || "{}"); } catch (_error) { coaDocuments = {}; }
      const normalizedDocuments = Object.fromEntries(Object.entries(coaDocuments).map(([key, value]) => [normalizedStrength(key), value]));
      const fallbackCoa = coaLink?.getAttribute("href") || "";

      const updateCoa = (variation) => {
        if (!coaLink) return;
        const strength = Object.values(variation?.attributes || {})[0] || "";
        const documentUrl = normalizedDocuments[normalizedStrength(strength)] || "";
        const resolvedUrl = documentUrl || fallbackCoa;
        coaLink.href = resolvedUrl;
        coaLink.toggleAttribute("target", Boolean(resolvedUrl));
        if (resolvedUrl) coaLink.setAttribute("rel", "noopener");
        else coaLink.removeAttribute("rel");
        if (coaCopy) coaCopy.textContent = "View the laboratory report for this release.";
        if (mobileCoaLink) mobileCoaLink.href = resolvedUrl;
      };

      const updatePresentation = (variation) => {
        if (price && variation.price_html) price.innerHTML = variation.price_html;
        if (submit && variation.display_price != null) submit.textContent = purchaseLabel(variation.display_price);
        if (availability) {
          const rawQuantity = variation.max_qty;
          const quantity = Number(rawQuantity);
          const hasQuantity = rawQuantity !== "" && rawQuantity != null && Number.isFinite(quantity) && quantity >= 0 && quantity < 9999;
          const text = variation.is_in_stock === false
            ? "Out of stock"
            : hasQuantity && quantity <= 9
              ? `Only ${quantity} vials left`
              : "In stock";
          availability.classList.toggle("is-out", variation.is_in_stock === false);
          availability.querySelector("strong").textContent = text;
        }
        updateCoa(variation);
      };

      const syncButtons = (select, row) => {
        row.querySelectorAll("button").forEach((button) => {
          const selected = button.dataset.value === select.value;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
      };

      const selectedAttributes = () => Object.fromEntries(selects.map((select) => [select.name, select.value]));
      const variationMatches = (variation, attributes) => Object.entries(variation.attributes || {}).every(([name, value]) => {
        if (!value) return true;
        return String(attributes[name] || "").toLowerCase() === String(value).toLowerCase();
      });
      const resolveVariation = () => {
        const attributes = selectedAttributes();
        const complete = selects.every((select) => Boolean(select.value));
        const variation = complete ? variations.find((item) => variationMatches(item, attributes)) : null;
        const available = Boolean(variation)
          && variation.variation_is_active !== false
          && variation.is_purchasable !== false
          && variation.is_in_stock !== false;

        const variationInput = form.querySelector("input.variation_id");
        if (variationInput) variationInput.value = variation ? String(variation.variation_id || "") : "";
        form.dataset.sundayResolvedVariation = variation ? String(variation.variation_id || "") : "";
        if (submit) {
          submit.disabled = !available;
          submit.classList.toggle("disabled", !available);
          submit.classList.toggle("wc-variation-selection-needed", !variation);
          submit.classList.toggle("wc-variation-is-unavailable", Boolean(variation) && !available);
          if (!variation) submit.textContent = complete ? "Unavailable" : "Select a strength";
        }
        if (variation) updatePresentation(variation);
        return variation;
      };

      const triggerSelectChange = (select) => {
        select.dispatchEvent(new Event("change", { bubbles: true }));
        if (typeof window.jQuery === "function") window.jQuery(select).trigger("change");
      };

      const selectFirstAvailable = (select, row) => {
        const requested = new URLSearchParams(window.location.search).has(select.name);
        if (!requested && select.dataset.sundayUserSelected !== "true") {
          const first = [...select.options].find((option) => option.value && !option.disabled);
          if (first) select.value = first.value;
        }
        syncButtons(select, row);
      };

      selects.forEach((select) => {
        const control = document.createElement("div");
        control.className = "sunday-product-variation-control";
        const label = document.createElement("span");
        label.className = "sunday-product-variation-label";
        label.textContent = form.closest(".sunday-product-v4") ? "Strength" : "Sizes";
        const row = document.createElement("div");
        row.className = "sunday-product-variation-buttons";
        row.setAttribute("aria-label", select.closest("tr")?.querySelector("label")?.textContent.trim() || "Choose option");
        [...select.options].filter((option) => option.value).forEach((option) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = variationLabel(option);
          button.dataset.value = option.value;
          button.disabled = option.disabled;
          button.setAttribute("aria-pressed", String(select.value === option.value));
          button.classList.toggle("is-selected", select.value === option.value);
          button.addEventListener("click", () => {
            select.dataset.sundayUserSelected = "true";
            select.value = option.value;
            syncButtons(select, row);
            triggerSelectChange(select);
            resolveVariation();
          });
          row.append(button);
        });
        control.append(label, row);
        select.closest("td")?.prepend(control);
        select.classList.add("sunday-product-native-select");
        select.addEventListener("change", () => {
          syncButtons(select, row);
          window.queueMicrotask(resolveVariation);
        });
        selectFirstAvailable(select, row);
      });

      const stabilizeInitialVariation = () => {
        selects.forEach((select) => {
          const row = select.closest("td")?.querySelector(".sunday-product-variation-buttons");
          if (row) selectFirstAvailable(select, row);
        });
        if (typeof window.jQuery === "function") window.jQuery(form).trigger("check_variations");
        resolveVariation();
      };

      if (typeof window.jQuery === "function") {
        window.jQuery(form).on("found_variation", function (_event, variation) {
          selects.forEach((select) => {
            const row = select.closest("td")?.querySelector(".sunday-product-variation-buttons");
            if (row) syncButtons(select, row);
          });
          const variationInput = form.querySelector("input.variation_id");
          if (variationInput && variation) variationInput.value = String(variation.variation_id || "");
          if (variation) updatePresentation(variation);
        });
        window.jQuery(form).on("reset_data hide_variation", resolveVariation);
        window.jQuery(form).on("wc_variation_form", stabilizeInitialVariation);
      }

      requestAnimationFrame(stabilizeInitialVariation);
      window.setTimeout(stabilizeInitialVariation, 180);
      window.setTimeout(stabilizeInitialVariation, 700);
      window.setTimeout(resolveVariation, 1800);
      window.setTimeout(resolveVariation, 3500);
      form.addEventListener("submit", (event) => {
        if (!resolveVariation()) event.preventDefault();
      }, true);
    });
  }

  function setupSinglePurchaseButtons(root) {
    root.querySelectorAll(".sunday-product-summary").forEach((summary) => {
      const button = summary.querySelector(".single_add_to_cart_button");
      const priceText = summary.querySelector("[data-sunday-single-price]")?.textContent || "";
      const price = summary.closest(".sunday-product-v4") ? Number(summary.querySelector("[data-sunday-single-price]")?.dataset.price) : Number(priceText.replace(/[^0-9.]/g, ""));
      if (!button) return;
      if (!button.classList.contains("disabled") && !button.classList.contains("wc-variation-selection-needed")) {
        button.textContent = purchaseLabel(price);
      }

      const mobileButton = summary.querySelector("[data-sunday-mobile-purchase]");
      if (mobileButton && !mobileButton.dataset.sundayReady) {
        mobileButton.dataset.sundayReady = "true";
        mobileButton.addEventListener("click", () => button.click());
      }
    });
  }

  function selectedVariation(card) {
    const button = card.querySelector("[data-sunday-card-variation].is-selected");
    if (!button) return { id: 0, attributes: {} };
    let attributes = {};
    try { attributes = JSON.parse(button.dataset.variationAttributes || "{}"); } catch (_error) { attributes = {}; }
    return { id: Number(button.dataset.variationId || 0), attributes };
  }

  function setupCards(root) {
    root.querySelectorAll("[data-sunday-product-card]").forEach((card) => {
      if (card.dataset.sundayReady) return;
      card.dataset.sundayReady = "true";
      const price = card.querySelector("[data-sunday-card-price]");
      const add = card.querySelector("[data-sunday-card-add]");
	  const image = card.querySelector("[data-sunday-card-image]");

      card.querySelectorAll("[data-sunday-card-variation]").forEach((button) => {
        button.addEventListener("click", () => {
          card.querySelectorAll("[data-sunday-card-variation]").forEach((other) => {
            const selected = other === button;
            other.classList.toggle("is-selected", selected);
            other.setAttribute("aria-pressed", String(selected));
          });
          if (price && button.dataset.variationPriceHtml) price.innerHTML = button.dataset.variationPriceHtml;
          else if (price && button.dataset.variationPrice) price.textContent = button.dataset.variationPrice;
		  if (image && button.dataset.variationImage) image.src = button.dataset.variationImage;
          if (add) {
            add.dataset.variationId = button.dataset.variationId || "0";
            add.dataset.variationAttributes = button.dataset.variationAttributes || "{}";
          }
        });
      });

    });
  }

  function setupGallery(root) {
    const gallery = root.querySelector("[data-sunday-product-gallery]");
    if (!gallery) return;
    const stage = gallery.querySelector("[data-sunday-gallery-open]");
    const thumbs = [...gallery.querySelectorAll("[data-sunday-gallery-media]")];
    const dialog = document.createElement("dialog");
    dialog.className = "sunday-product-lightbox";
    dialog.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt=""><video controls playsinline hidden></video>';
    document.body.append(dialog);
    const image = dialog.querySelector("img");
    const video = dialog.querySelector("video");
    const close = dialog.querySelector("button");
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

    const showMedia = (button) => {
      if (!stage) return;
      const type = button.dataset.mediaType || "image";
      const source = button.dataset.sundayGalleryMedia || "";
      const role = button.dataset.mediaRole || "lifestyle";
      const position = button.dataset.mediaPosition || "50% 50%";
      thumbs.forEach((thumb) => {
        const active = thumb === button;
        thumb.classList.toggle("is-active", active);
        thumb.setAttribute("aria-selected", String(active));
      });
      stage.dataset.mediaType = type;
      stage.dataset.mediaSource = source;
      stage.dataset.mediaRole = role;
      stage.style.setProperty("--sunday-media-position", position);
      stage.replaceChildren();
      const media = document.createElement(type === "video" ? "video" : "img");
      media.src = source;
      if (type === "video") {
        media.autoplay = true;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.play().catch(() => {});
      } else {
        media.alt = `${document.querySelector(".sunday-product-summary h1")?.textContent.trim() || "Sunday product"} presentation`;
        media.decoding = "async";
      }
      stage.append(media);
    };

    thumbs.forEach((button) => button.addEventListener("click", () => showMedia(button)));
    if (thumbs[0]) showMedia(thumbs[0]);
    stage?.addEventListener("click", () => {
      const type = stage.dataset.mediaType || "image";
      const source = stage.dataset.mediaSource || stage.querySelector("img, video")?.src || "";
      image.hidden = type === "video";
      video.hidden = type !== "video";
      if (type === "video") {
        video.src = source;
      } else {
        image.src = source;
        image.alt = stage.querySelector("img")?.alt || "Product image";
      }
      dialog.showModal();
    });
    gallery.querySelectorAll("[data-sunday-gallery-image]").forEach((button) => {
      button.addEventListener("click", () => {
        image.src = button.dataset.sundayGalleryImage;
        image.alt = button.querySelector("img")?.alt || "Product image";
        dialog.showModal();
      });
    });
  }

  function setupShopFeaturedMotion(root) {
    const section = root.querySelector(".sunday-shop-featured-product");
    if (!section || section.dataset.sundayMotionReady) return;
    section.dataset.sundayMotionReady = "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = () => section.classList.add("is-in-view");

    section.classList.add("is-motion-ready");
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        reveal();
        observer.disconnect();
      }, { rootMargin: "0px 0px -8%", threshold: 0.18 });
      observer.observe(section);
    } else {
      reveal();
    }

    if (reducedMotion.matches) return;
    section.querySelectorAll(".sunday-shop-featured-product__card, .sunday-shop-featured-product__story").forEach((target, index) => {
      let frame = 0;
      let point = null;
      let bounds = null;
      const productCard = target.classList.contains("sunday-shop-featured-product__card");
      const render = () => {
        frame = 0;
        if (!point || !bounds) return;
        const x = Math.max(-1, Math.min(1, ((point.x - bounds.left) / bounds.width - 0.5) * 2));
        const y = Math.max(-1, Math.min(1, ((point.y - bounds.top) / bounds.height - 0.5) * 2));
        target.style.setProperty("--shop-card-tilt-x", `${y * (index ? -3.8 : -3.1)}deg`);
        target.style.setProperty("--shop-card-tilt-y", `${x * (index ? 5 : 4.1)}deg`);
        target.style.setProperty("--shop-card-shift-x", `${x * 3}px`);
        target.style.setProperty("--shop-card-shift-y", `${y * 2}px`);
      };
      const move = (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        bounds = bounds || target.getBoundingClientRect();
        point = { x: event.clientX, y: event.clientY };
        target.classList.add("is-tilting");
        if (productCard) target.classList.add("is-product-engaged");
        if (!frame) frame = requestAnimationFrame(render);
      };
      const reset = () => {
        bounds = null;
        point = null;
        target.classList.remove("is-tilting", "is-product-engaged");
        target.style.setProperty("--shop-card-tilt-x", "0deg");
        target.style.setProperty("--shop-card-tilt-y", "0deg");
        target.style.setProperty("--shop-card-shift-x", "0px");
        target.style.setProperty("--shop-card-shift-y", "0px");
      };
      target.addEventListener("pointerenter", move, { passive: true });
      target.addEventListener("pointermove", move, { passive: true });
      target.addEventListener("pointerleave", reset, { passive: true });
      target.addEventListener("focusin", () => productCard && target.classList.add("is-product-engaged"));
      target.addEventListener("focusout", (event) => { if (!target.contains(event.relatedTarget)) reset(); });
    });
  }

  function init(root) {
    setupAccordions(root);
    placeAvailability(root);
    setupVariationForms(root);
    setupSinglePurchaseButtons(root);
    setupCards(root);
    setupGallery(root);
	setupShopFeaturedMotion(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document));
  } else {
    init(document);
  }
})();

(function () {
  'use strict';

  function initializeSundayShopFilters() {
    var filter = document.getElementById('sunday-category-filter');

    if (!filter || filter.dataset.instantFilter !== 'true') {
      return;
    }

    var links = Array.prototype.slice.call(
      filter.querySelectorAll('.sunday-filter-row a')
    );

    var cards = Array.prototype.slice.call(
      document.querySelectorAll(
        '.sunday-shop-grid [data-sunday-product-card]'
      )
    );

    var count = filter.querySelector('.sunday-category-count');
    var totalProducts = Number(filter.dataset.totalProducts || 0);
    var allowed = [
      'all',
      'melting-strips',
      'bundles'
    ];

    if (!links.length || !cards.length || !count) {
      return;
    }

    /*
     * If WooCommerce pagination prevented the complete catalog from
     * being rendered, keep the normal links and use server filtering.
     */
    if (totalProducts && cards.length !== totalProducts) {
      return;
    }

    function categoryForLink(link) {
      return new URL(
        link.href,
        window.location.href
      ).searchParams.get('category') || 'all';
    }

    function categoryForLocation() {
      var requested = new URL(
        window.location.href
      ).searchParams.get('category') || 'all';

      return allowed.indexOf(requested) === -1
        ? 'all'
        : requested;
    }

    function cardMatches(card, category) {
      if (category === 'all') {
        return true;
      }

      var categories = card.dataset.productCategories || '';

      return categories
        .split(/\s+/)
        .indexOf(category) !== -1;
    }

    function applyFilter(category, updateHistory) {
      var visibleCount = 0;

      cards.forEach(function (card) {
        var visible = cardMatches(card, category);

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      links.forEach(function (link) {
        if (categoryForLink(link) === category) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      count.textContent =
        visibleCount +
        (visibleCount === 1 ? ' product' : ' products');

      if (updateHistory) {
        var url = new URL(window.location.href);

        if (category === 'all') {
          url.searchParams.delete('category');
        } else {
          url.searchParams.set('category', category);
        }

        url.hash = 'sunday-current-batch';

        window.history.pushState(
          { sundayCategory: category },
          '',
          url
        );
      }
    }

    filter.addEventListener('click', function (event) {
      var link = event.target.closest(
        '.sunday-filter-row a'
      );

      if (!link || !filter.contains(link)) {
        return;
      }

      event.preventDefault();

      applyFilter(
        categoryForLink(link),
        true
      );
    });

    window.addEventListener('popstate', function () {
      applyFilter(
        categoryForLocation(),
        false
      );
    });

    applyFilter(
      categoryForLocation(),
      false
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeSundayShopFilters,
      { once: true }
    );
  } else {
    initializeSundayShopFilters();
  }
}());
/* Small presentation controls layered over native WooCommerce and the existing bundle configurator. */
(function () {
  function init() {
    const root = document.querySelector('.sunday-product-v4');
    if (!root) return;
    const gallery = root.querySelector('[data-sunday-product-gallery]');
    const thumbs = [...gallery.querySelectorAll('[data-sunday-gallery-media]')];
    const current = () => Math.max(0, thumbs.findIndex(x => x.getAttribute('aria-selected') === 'true'));
    const counter = gallery.querySelector('.sv4-media-count');
    const count = () => { counter.textContent = `${current() + 1} / ${thumbs.length}`; };
    gallery.querySelectorAll('[data-sv4-direction]').forEach(button => button.addEventListener('click', () => thumbs[(current() + Number(button.dataset.sv4Direction) + thumbs.length) % thumbs.length]?.click()));
    new MutationObserver(count).observe(gallery.querySelector('.sunday-product-gallery__thumbs'), {attributes: true, subtree: true, attributeFilter: ['aria-selected']});
    count();
    const summary = root.querySelector('.sunday-product-summary');
    const availability = summary.querySelector('.sunday-product-summary__availability');
    const eyebrow = summary.querySelector('.sv4-eyebrow');
    const repairAvailability = () => { if (availability.parentElement !== eyebrow) eyebrow.append(availability); };
    repairAvailability();
    new MutationObserver(repairAvailability).observe(summary, {childList: true, subtree: true});
    const form = summary.querySelector('form.cart');
    if (!form) return;
    const button = form.querySelector('.single_add_to_cart_button');
    const quantity = form.querySelector('input.qty[name="quantity"]')?.closest('.quantity');
    if (quantity && !quantity.classList.contains('sv4-quantity')) {
      const input = quantity.querySelector('input.qty');
      if (input && input.type !== 'hidden') {
        quantity.classList.add('sv4-quantity');
        const label = document.createElement('label'); label.className = 'sv4-quantity-label'; label.textContent = 'Quantity'; label.htmlFor = input.id;
        quantity.before(label);
        // Kadence may already provide quantity controls; reuse them when present.
        if (!quantity.querySelector('button, .plus, .minus')) {
          [-1, 1].forEach(direction => {
            const control = document.createElement('button'); control.type = 'button'; control.textContent = direction < 0 ? '−' : '+';
            control.setAttribute('aria-label', direction < 0 ? 'Decrease quantity' : 'Increase quantity');
            control.addEventListener('click', () => {
              direction < 0 ? input.stepDown() : input.stepUp();
              input.dispatchEvent(new Event('change', {bubbles: true}));
            });
            direction < 0 ? quantity.prepend(control) : quantity.append(control);
          });
        }
      }
    }
    const payments = summary.querySelector('.sv4-payments');
    const checkout = summary.querySelector('.sv4-checkout-cta');
    if (checkout && payments) checkout.after(payments);
    else if (button && payments) button.before(payments);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();


/* Sunday responsive reference layout 20260928 */
(function () {
  'use strict';
  if (window.__sundayReferenceLayout20260928) return;
  window.__sundayReferenceLayout20260928 = true;
  const media = window.matchMedia('(max-width: 760px)');

  function appendExisting(parent, items) {
    items.filter(Boolean).forEach((item) => parent.append(item));
  }

  function applySundayReferenceLayout() {
    const root = document.querySelector('#primary.sunday-product-v4');
    if (!root) return;

    const grid = root.querySelector('.sv4-grid');
    const galleryColumn = root.querySelector('.sv4-gallery-column');
    const gallery = root.querySelector('.sunday-product-gallery');
    const trust = root.querySelector('.sv4-trust-strip');
    const summary = root.querySelector('.sunday-product-summary');
    const recommendations = root.querySelector('.sv4-recommendations');
    const bottom = root.querySelector('.sv4-bottom');
    const faq = root.querySelector('.sv4-faq');
    const notice = root.querySelector('.sv4-research-notice');
    const mission = root.querySelector('.sv4-mission');
    if (!grid || !galleryColumn || !gallery || !trust || !summary || !recommendations || !bottom) return;

    const eyebrow = summary.querySelector(':scope > .sv4-eyebrow');
    const title = summary.querySelector(':scope > h1, :scope > .sv4-mobile-title-row > h1');
    const titlePromo = summary.querySelector(':scope > .sv4-title-promo');
    const useLabel = summary.querySelector('.sv4-use-label');
    const rating = summary.querySelector(':scope > .woocommerce-product-rating');
    const description = summary.querySelector(':scope > .sunday-product-summary__description');
    const bogo = summary.querySelector(':scope > .sv4-bogo-card');
    const price = summary.querySelector(':scope > [data-sunday-single-price], :scope > .sv4-mobile-title-row > [data-sunday-single-price]');
    const purchase = summary.querySelector(':scope > .sunday-product-summary__purchase');
    const payments = summary.querySelector(':scope > .sv4-payments');
    const shipping = summary.querySelector(':scope > .sv4-shipping');
    const coa = root.querySelector('.sunday-product-summary__coa');

    root.classList.toggle('sv4-layout-mobile', media.matches);

    if (media.matches) {
      let heading = summary.querySelector(':scope > .sv4-mobile-title-row');
      if (!heading) {
        heading = document.createElement('div');
        heading.className = 'sv4-mobile-title-row';
      }
      appendExisting(heading, [title, price, useLabel]);
      appendExisting(summary, [eyebrow, heading, titlePromo, rating, bogo, purchase, payments, description, shipping]);
      recommendations.after(trust);
      if (coa) trust.after(coa);
      appendExisting(bottom, [faq, notice, mission]);
    } else {
      const heading = summary.querySelector(':scope > .sv4-mobile-title-row');
      if (eyebrow && useLabel) eyebrow.prepend(useLabel);
      appendExisting(summary, [eyebrow, title, titlePromo, rating, description, bogo, price, purchase, payments, shipping, coa]);
      if (heading) heading.remove();
      gallery.after(trust);
      appendExisting(bottom, [faq, notice, mission]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySundayReferenceLayout, { once: true });
  } else {
    applySundayReferenceLayout();
  }
  window.addEventListener('load', applySundayReferenceLayout, { once: true });
  media.addEventListener('change', applySundayReferenceLayout);
})();
