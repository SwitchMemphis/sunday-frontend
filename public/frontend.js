/* Standalone demo adapter. No orders, authentication, analytics or form delivery. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)||0);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cart=[];try{cart=JSON.parse(localStorage.getItem('sunday-design-cart')||'[]');if(!Array.isArray(cart))cart=[];}catch{}
let toastTimer;
function toast(text){let t=$('.demo-toast');if(!t){t=document.createElement('div');t.className='demo-toast';t.setAttribute('role','status');document.body.append(t);}t.textContent=text;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,6000);}
function save(){try{localStorage.setItem('sunday-design-cart',JSON.stringify(cart));}catch{}renderCart();}
function add(item){const found=cart.find(x=>x.key===item.key);if(found)found.qty+=item.qty;else cart.push(item);save();$('[data-sunday-open="cart"]')?.click();}
function itemMarkup(x){return `<div class="demo-cart-item"><img src="${escape(x.image)}" alt="${escape(x.name)}"><div><h3><a href="${escape(x.url)}">${escape(x.name)}</a></h3><p>${escape(x.variant||'')} · ${money(x.price)}</p><div class="demo-cart-controls"><button data-cart-step="-1" data-key="${escape(x.key)}" aria-label="Decrease ${escape(x.name)} quantity">−</button><span>${x.qty}</span><button data-cart-step="1" data-key="${escape(x.key)}" aria-label="Increase ${escape(x.name)} quantity">+</button><button data-cart-remove="${escape(x.key)}">Remove</button></div></div></div>`;}
function renderCart(){
 const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>s+x.qty*x.price,0);
 $$('[data-sunday-cart-count]').forEach(e=>e.textContent=count);
 const content=`<div class="sunday-drawer__heading"><p>Shopping bag</p><h2 id="sunday-cart-title">${count?'Your bag':'Your bag is empty'}</h2></div><p class="demo-notice">Design preview. Selections stay in this browser. No purchase can be made.</p>${count?cart.map(itemMarkup).join('')+`<div class="demo-cart-total"><span>Subtotal</span><strong>${money(total)}</strong></div><p class="demo-notice">Promotions, shipping and taxes are not applied in this frontend demo.</p><a class="sunday-shell-button sunday-shell-button--dark" href="/checkout/">Continue to checkout</a>`:'<p class="demo-cart-empty">Browse the current release and add a research material to begin.</p><a class="sunday-shell-button sunday-shell-button--dark" href="/shop/">Shop current release →</a>'}`;
 $$('[data-sunday-cart-fragment], [data-demo-cart-page]').forEach(e=>{if(e.hasAttribute('data-preserve-empty')){if(!e.dataset.emptyMarkup)e.dataset.emptyMarkup=e.innerHTML;e.innerHTML=count?content:e.dataset.emptyMarkup+'<p class="demo-notice">Design preview. Checkout is not connected.</p>';}else e.innerHTML=content;});
}
document.body.classList.remove('woocommerce-no-js');document.body.classList.add('woocommerce-js');
const badge=document.createElement('button');badge.type='button';badge.className='demo-preview-badge';badge.textContent='Design preview';badge.addEventListener('click',()=>toast('Frontend recreation. Prices, stock and claims are a captured design reference. Forms, accounts and purchases are not connected.'));document.body.append(badge);
renderCart();
document.addEventListener('click',async e=>{
 const step=e.target.closest('[data-cart-step]'),remove=e.target.closest('[data-cart-remove]');
 if(step){const item=cart.find(x=>x.key===step.dataset.key);if(item)item.qty=Math.max(1,Math.min(99,item.qty+Number(step.dataset.cartStep)));save();return;}
 if(remove){cart=cart.filter(x=>x.key!==remove.dataset.cartRemove);save();return;}
 const blocked=e.target.closest('[data-demo-link]');if(blocked){e.preventDefault();toast('This service is not connected in the design preview.');return;}
 const addButton=e.target.closest('[data-sunday-card-add]');
 if(addButton){e.preventDefault();if(addButton.disabled)return;const card=addButton.closest('[data-sunday-product-card]');const selected=$('[data-sunday-card-variation].is-selected',card),p=$('[data-sunday-card-price]',card);const amount=$('ins .amount',p)||$('.amount',p)||p;add({key:addButton.dataset.productId+'-'+(selected?.dataset.variationId||''),name:$('h3',card).textContent.trim(),url:$('h3 a',card).getAttribute('href'),image:$('img',card)?.getAttribute('src'),variant:selected?.textContent.trim()||'',price:Number(amount.textContent.replace(/[^\d.]/g,'')),qty:1});}
 const accordion=e.target.closest('button[aria-expanded]');
 if(accordion&&!accordion.closest('[data-sunday-accordion]')&&!accordion.matches('[data-sunday-open], [data-sunday-menu]')){
  let panel=accordion.getAttribute('aria-controls')?document.getElementById(accordion.getAttribute('aria-controls')):null;
  if(!panel)panel=accordion.parentElement.querySelector('.sv4-faq-answer, .sv4-accordion-panel')||accordion.nextElementSibling;
  if(panel&& !panel.matches('button')){const open=accordion.getAttribute('aria-expanded')!=='true';accordion.setAttribute('aria-expanded',String(open));panel.hidden=!open;panel.style.height=open?'auto':'0px';accordion.parentElement.classList.toggle('is-open',open);}
 }
});
document.addEventListener('submit',e=>{
 const form=e.target;if(form.matches('[data-sunday-search-form]'))return;e.preventDefault();
 if(form.matches('form.cart')){
  const title=$('.sunday-product-summary h1')?.textContent.trim();
  let variations=[];try{variations=JSON.parse(form.dataset.product_variations||'[]');}catch{}
  const selected=variations.find(v=>Object.entries(v.attributes).every(([k,value])=>!value||form.elements[k]?.value===value));
  const qty=Math.max(1,Math.min(99,Number($('input.qty',form)?.value)||1));
  if(form.matches('.variations_form')&&!selected){toast('Choose an available strength first.');return;}
  if(selected?.is_in_stock===false){toast('This variant is unavailable.');return;}
  const priceEl=$('[data-sunday-single-price]');
  const amount=priceEl?$('ins .amount',priceEl)||$('.amount',priceEl)||priceEl:null;
  add({key:(form.dataset.product_id||location.pathname)+'-'+(selected?.variation_id||Array.from(form.querySelectorAll('select')).map(x=>x.value).join('-')),name:title||document.title.replace(' - Sunday',''),url:location.pathname,image:$('[data-sunday-gallery-open] img')?.getAttribute('src')||'',variant:selected?Object.values(selected.attributes).join(' / '):Array.from(form.querySelectorAll('select')).map(x=>x.value).join(' / '),price:selected?.display_price??Number((amount?.textContent||'').replace(/[^\d.]/g,'')),qty});
 }else{toast('Design preview only. Nothing was sent and no account was created.');}
},true);
// Keep dialog background and focus isolated without changing reference layout.
const shell=$('[data-sunday-shell]');
if(shell){new MutationObserver(()=>{const open=$('[data-sunday-panel].is-open');const wrapper=$('#wrapper');if(wrapper)wrapper.inert=!!open;const footer=$('#tbp_footer');if(footer&&!shell.contains(footer))footer.inert=!!open;}).observe(shell,{subtree:true,attributes:true,attributeFilter:['class','hidden']});}
// Useful account form boundaries without accepting real passwords.
$$('form').filter(f=>!f.matches('form.cart, [data-sunday-search-form], .sunday-footer-form')).forEach(f=>{
 if(!f.querySelector('.demo-notice')){const note=document.createElement('p');note.className='demo-notice';note.textContent='Design preview. This form does not send information or create an account.';f.prepend(note);}
});
// Keyboard gallery navigation follows visual tab order.
$$('[data-sunday-gallery-media]').forEach(tab=>tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-sunday-gallery-media]',tab.parentElement),i=tabs.indexOf(tab);const next=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.click();next.focus();}));

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
    const account = document.querySelector("[data-sunday-account]");
    if (!account) return;

    const tabs = Array.from(account.querySelectorAll("[data-account-tab]"));
    const panels = Array.from(account.querySelectorAll("[data-account-panel]"));

    const selectPanel = (name, moveFocus) => {
      const selectedTab = tabs.find((tab) => tab.dataset.accountTab === name);
      if (!selectedTab) return;

      tabs.forEach((tab) => {
        const active = tab === selectedTab;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const active = panel.dataset.accountPanel === name;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      if (moveFocus) selectedTab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectPanel(tab.dataset.accountTab, false));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        selectPanel(tabs[nextIndex].dataset.accountTab, true);
      });
    });

    if (window.location.hash.toLowerCase() === "#register") {
      selectPanel("register", false);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash.toLowerCase() === "#register") selectPanel("register", false);
      if (window.location.hash.toLowerCase() === "#login") selectPanel("login", false);
    });

    account.addEventListener("click", (event) => {
      const button = event.target.closest(".sunday-password-toggle");
      if (!button || !account.contains(button)) return;

      const wrapper = button.closest(".sunday-password-wrap");
      const input = wrapper ? wrapper.querySelector("input") : null;
      if (!input) return;

      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.setAttribute("aria-pressed", String(!visible));
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });

    account.querySelectorAll(".sunday-password-wrap input[type='password'], .sunday-password-wrap input[type='text']").forEach((input) => {
      const wrapper = input.closest(".sunday-password-wrap");
      if (!wrapper || wrapper.querySelector(".sunday-password-toggle")) return;

      const button = document.createElement("button");
      button.className = "sunday-password-toggle";
      button.type = "button";
      button.setAttribute("aria-controls", input.id);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Show password");
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.75"></circle></svg>';

      wrapper.append(button);
    });
  });
})();

(() => {
  "use strict";

  function setupBundleForms(root) {
    root.querySelectorAll("form.bundle_form").forEach((form) => {
      if (form.dataset.sundayBundleReady) return;
      form.dataset.sundayBundleReady = "true";

      const items = [...form.querySelectorAll(".bundled_products > .bundled_product")];
      items.forEach((item, index) => {
        const title = item.querySelector(".bundled_product_title");
        if (!title) return;

        const variableCart = item.querySelector(".bundled_item_cart_content[data-product_variations]");
        let allowedVariations = [];
        try {
          allowedVariations = JSON.parse(variableCart?.dataset.product_variations || "[]");
        } catch (_error) {
          allowedVariations = [];
        }

        const eyebrow = document.createElement("span");
        eyebrow.className = "sunday-bundle-item__eyebrow";
        eyebrow.textContent = `${String(index + 1).padStart(2, "0")} · ${item.querySelector("table.variations") ? "Select Product Variant" : "Included"}`;
        title.parentNode.insertBefore(eyebrow, title);

        item.querySelectorAll("table.variations select").forEach((select) => {
          const label = select.closest("tr")?.querySelector("label")?.textContent.trim();
          if (label && !select.getAttribute("aria-label")) select.setAttribute("aria-label", label);

          const attributeName = select.dataset.attribute_name || "";
          const allowedValues = new Set(
            allowedVariations
              .map((variation) => variation.attributes?.[attributeName])
              .filter(Boolean)
              .map((value) => String(value).toLowerCase())
          );
          const isAllowed = (option) => !allowedValues.size || allowedValues.has(String(option.value).toLowerCase());
          [...select.options].forEach((option) => {
            if (option.value && !isAllowed(option)) {
              option.disabled = true;
              option.hidden = true;
            }
          });

          const control = document.createElement("div");
          control.className = "sunday-product-variation-control sunday-bundle-variation-control";
          const controlLabel = document.createElement("span");
          controlLabel.className = "sunday-product-variation-label";
          controlLabel.textContent = "Sizes";
          const buttons = document.createElement("div");
          buttons.className = "sunday-product-variation-buttons";
          buttons.setAttribute("aria-label", label || "Choose size");

          const syncButtons = () => {
            buttons.querySelectorAll("button").forEach((button) => {
              const selected = button.dataset.value === select.value;
              button.classList.toggle("is-selected", selected);
              button.setAttribute("aria-pressed", String(selected));
            });
          };

          [...select.options].filter((option) => option.value && isAllowed(option)).forEach((option) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = option.textContent.trim().toUpperCase();
            button.dataset.value = option.value;
            button.disabled = option.disabled;
            button.addEventListener("click", () => {
              select.value = option.value;
              syncButtons();
              select.dispatchEvent(new Event("change", { bubbles: true }));
            });
            buttons.append(button);
          });

          control.append(controlLabel, buttons);
          select.closest("td")?.prepend(control);
          select.classList.add("sunday-product-native-select");
          select.addEventListener("change", syncButtons);
          syncButtons();
        });
      });

      const summary = form.closest(".sunday-product-summary");
      const availability = summary?.querySelector(".sunday-product-summary__availability");
      const bundleButton = form.querySelector(".bundle_button");
      if (bundleButton && availability) bundleButton.parentNode.insertBefore(availability, bundleButton);
      const summaryPrice = summary?.querySelector("[data-sunday-single-price]");
      const initialPrice = summaryPrice?.innerHTML || "";
      const livePrice = form.querySelector(".bundle_price");
      const button = form.querySelector(".single_add_to_cart_button");
      const selects = [...form.querySelectorAll("table.variations select")];

      const amount = (element) => {
        const value = String(element?.textContent || "").replace(/[^0-9.-]/g, "");
        return value ? Number(value) : Number.NaN;
      };

      const priceHtml = (regular, sale) => {
        const regularText = regular.toFixed(2);
        const saleText = sale.toFixed(2);
        return `<span class="price"><del aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol" translate="no">&#36;</span>${regularText}</bdi></span></del><span class="screen-reader-text">Original price was: &#36;${regularText}.</span> <ins aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol" translate="no">&#36;</span>${saleText}</bdi></span></ins><span class="screen-reader-text">Current price is: &#36;${saleText}.</span></span>`;
      };

      const resolveVariable = (cart) => {
        let variations = [];
        try { variations = JSON.parse(cart.dataset.product_variations || "[]"); } catch (_error) { variations = []; }
        const itemId = cart.dataset.bundled_item_id || "";
        const itemSelects = [...cart.querySelectorAll("table.variations select")];
        const complete = itemSelects.every((select) => Boolean(select.value));
        const variation = complete ? variations.find((candidate) => Object.entries(candidate.attributes || {}).every(([name, value]) => {
          const select = cart.querySelector(`[name="bundle_${name}_${itemId}"]`);
          return !value || String(select?.value || "").toLowerCase() === String(value).toLowerCase();
        })) : null;
        const available = Boolean(variation)
          && variation.variation_is_active !== false
          && variation.is_purchasable !== false
          && variation.is_in_stock !== false;
        const variationInput = cart.querySelector("input.variation_id");
        if (variationInput) variationInput.value = available ? String(variation.variation_id || "") : "";
        const variationPrice = cart.querySelector(".woocommerce-variation-price");
        if (variationPrice) variationPrice.innerHTML = available ? (variation.price_html || "") : "";
        return available ? {
          regular: Number(variation.display_regular_price),
          sale: Number(variation.display_price),
        } : null;
      };

      const resolveSimple = (item) => {
        if (item.querySelector(".out-of-stock")) return null;
        const price = item.querySelector(".bundled_item_cart_details > .price");
        const regular = amount(price?.querySelector("del .amount") || price?.querySelector(".amount"));
        const sale = amount(price?.querySelector("ins .amount") || [...(price?.querySelectorAll(".amount") || [])].at(-1));
        return Number.isFinite(regular) && Number.isFinite(sale) ? { regular, sale } : null;
      };

      const syncBundle = () => {
        let regular = 0;
        let sale = 0;
        let valid = true;
        items.forEach((item) => {
          const variableCart = item.querySelector(".bundled_item_cart_content[data-product_variations]");
          const prices = variableCart ? resolveVariable(variableCart) : resolveSimple(item);
          if (!prices) valid = false;
          else {
            regular += prices.regular;
            sale += prices.sale;
          }
        });

        const html = valid ? priceHtml(regular, sale) : "";
        if (summaryPrice) summaryPrice.innerHTML = html || initialPrice;
        if (livePrice) livePrice.innerHTML = html;
        if (button) {
          button.textContent = valid ? "Add to Cart" : "Select options";
          button.disabled = !valid;
          button.classList.toggle("disabled", !valid);
        }
      };

      selects.forEach((select) => select.addEventListener("change", syncBundle));
      form.addEventListener("submit", (event) => {
        syncBundle();
        if (button?.disabled) event.preventDefault();
      }, true);
      syncBundle();
    });
  }

  function init() {
    setupBundleForms(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
