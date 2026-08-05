(function exposeUi(global) {
  "use strict";

  const utils = global.AppUtils;

  function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.text !== undefined) {
      element.textContent = String(options.text);
    }

    if (options.attrs) {
      Object.entries(options.attrs).forEach(([name, value]) => {
        element.setAttribute(name, String(value));
      });
    }

    return element;
  }

  class AppUI {
    constructor() {
      this.elements = {
        connectionBadge: document.getElementById("connectionBadge"),
        statusPanel: document.getElementById("statusPanel"),
        statusTitle: document.getElementById("statusTitle"),
        statusMessage: document.getElementById("statusMessage"),
        productSearch: document.getElementById("productSearch"),
        categoryTabs: document.getElementById("categoryTabs"),
        categoryScrollLeft:
          document.getElementById("categoryScrollLeft"),
        categoryScrollRight:
          document.getElementById("categoryScrollRight"),
        productList: document.getElementById("productList"),
        productCount: document.getElementById("productCount"),
        selectedProduct: document.getElementById("selectedProduct"),
        decreaseQuantity: document.getElementById("decreaseQuantity"),
        quantity: document.getElementById("quantity"),
        increaseQuantity: document.getElementById("increaseQuantity"),
        paymentFieldset: document.querySelector(".payment-group"),
        customerName: document.getElementById("customerName"),
        vendorPicker: document.getElementById("vendorPicker"),
        addToCartButton: document.getElementById("addToCartButton"),
        cartList: document.getElementById("cartList"),
        cartCount: document.getElementById("cartCount"),
        clearCartButton: document.getElementById("clearCartButton"),
        messagePreview: document.getElementById("messagePreview"),
        submitAllButton: document.getElementById("submitAllButton"),
        toast: document.getElementById("toast")
      };

      this.toastTimerId = null;
    }

    setConnectionBadge(text, state = "neutral") {
      const badge = this.elements.connectionBadge;
      badge.textContent = text;
      badge.dataset.state = state;
    }

    setStatus(title, message, state = "loading") {
      const panel = this.elements.statusPanel;

      panel.dataset.state = state;
      this.elements.statusTitle.textContent = title;
      this.elements.statusMessage.textContent = message;

      const spinner = panel.querySelector(".spinner");
      spinner.hidden = state !== "loading";
    }

    setStatusHidden(hidden) {
      this.elements.statusPanel.hidden = Boolean(hidden);
    }

setControlsEnabled(enabled) {
    this.elements.productSearch.disabled = !enabled;
    this.elements.quantity.disabled = !enabled;
    this.elements.decreaseQuantity.disabled = !enabled;
    this.elements.increaseQuantity.disabled = !enabled;
    this.elements.paymentFieldset.disabled = !enabled;
    this.elements.customerName.disabled = !enabled;
    this.elements.addToCartButton.disabled = !enabled;

    // 舊版 index.html 仍在快取時取不到容器，
    // 此時略過即可，不得讓整個初始化中斷
    if (this.elements.vendorPicker) {
      this.elements.vendorPicker
        .querySelectorAll(".vendor-chip")
        .forEach((chip) => {
          chip.disabled = !enabled;
        });
    }
}

    /**
     * 廠商客戶名稱快選。
     * 點選後直接帶入客戶名稱欄位，仍可手動輸入或修改。
     */
    renderVendorPicker(vendorNames, onSelect) {
      const container = this.elements.vendorPicker;

      // 容器或清單缺一不可；舊版檔案殘留在快取時兩者都可能取不到，
      // 此時略過快選即可，不得讓整個初始化中斷
      if (!container || !Array.isArray(vendorNames)) {
        return;
      }

      container.replaceChildren();

      vendorNames.forEach((vendorName) => {
        const button = createElement("button", {
          className: "vendor-chip",
          text: vendorName,
          attrs: {
            type: "button",
            "data-vendor": vendorName
          }
        });

        button.disabled = this.elements.customerName.disabled;
        button.addEventListener("click", () => {
          onSelect(vendorName);
        });

        container.appendChild(button);
      });
    }

    /**
     * 依目前客戶名稱標示對應的廠商按鈕，
     * 手動輸入時也會同步，比對忽略大小寫與前後空白。
     */
    syncVendorPicker(customerName) {
      if (!this.elements.vendorPicker) {
        return;
      }

      const current =
        utils.normalizeText(customerName).toLowerCase();

      this.elements.vendorPicker
        .querySelectorAll(".vendor-chip")
        .forEach((chip) => {
          const vendorName =
            String(chip.dataset.vendor || "").toLowerCase();

          chip.classList.toggle(
            "is-active",
            Boolean(current) && vendorName === current
          );
        });
    }

    renderCategories(categories, activeCategory, onSelect) {
      const container = this.elements.categoryTabs;
      container.replaceChildren();

      categories.forEach((category) => {
        const button = createElement("button", {
          className:
            "category-tab" +
            (category === activeCategory ? " is-active" : ""),
          text: category,
          attrs: {
            type: "button",
            "data-category": category
          }
        });

        button.addEventListener("click", () => {
          const isActive =
            button.classList.contains("is-active");

          onSelect(isActive ? "" : category);
        });

        container.appendChild(button);
      });

      this.updateCategoryScrollButtons();
    }

    updateActiveCategory(activeCategory) {
      const container = this.elements.categoryTabs;

      container
        .querySelectorAll(".category-tab")
        .forEach((button) => {
          button.classList.toggle(
            "is-active",
            button.dataset.category === activeCategory
          );
        });
    }

    updateSelectedProductHighlight(previousCode, selectedCode) {
      const container = this.elements.productList;

      if (previousCode) {
        const previousButton = container.querySelector(
          `[data-product-code="${CSS.escape(previousCode)}"]`
        );

        if (previousButton) {
          previousButton.classList.remove("is-selected");
        }
      }

      if (selectedCode) {
        const selectedButton = container.querySelector(
          `[data-product-code="${CSS.escape(selectedCode)}"]`
        );

        if (selectedButton) {
          selectedButton.classList.add("is-selected");
        }
      }
    }

    scrollCategories(direction) {
      const container = this.elements.categoryTabs;

      container.scrollBy({
        left: direction * container.clientWidth * 0.8,
        behavior: "smooth"
      });
    }

    updateCategoryScrollButtons() {
      const container = this.elements.categoryTabs;
      const canScroll =
        container.scrollWidth > container.clientWidth + 1;

      this.elements.categoryScrollLeft.hidden = !canScroll;
      this.elements.categoryScrollRight.hidden = !canScroll;

      if (!canScroll) {
        return;
      }

      this.elements.categoryScrollLeft.disabled =
        container.scrollLeft <= 0;
      this.elements.categoryScrollRight.disabled =
        container.scrollLeft + container.clientWidth
          >= container.scrollWidth - 1;
    }

    renderProducts(products, selectedCode, onSelect, options = {}) {
      const container = this.elements.productList;
      container.replaceChildren();

      this.elements.productCount.textContent =
        options.totalCount != null
          ? `${products.length} / ${options.totalCount} 項`
          : `${products.length} 項`;

      if (products.length === 0) {
        container.appendChild(
          this.createEmptyState(
            options.emptyIcon || "🔎",
            options.emptyMessage || "找不到符合條件的商品。"
          )
        );
        return;
      }

      const fragment = document.createDocumentFragment();

      products.forEach((product) => {
        const button = createElement("button", {
          className:
            "product-card" +
            (product.code === selectedCode
              ? " is-selected"
              : ""),
          attrs: {
            type: "button",
            "data-product-code": product.code
          }
        });

        const main = createElement("span", {
          className: "product-card-main"
        });

        const code = createElement("strong", {
          className: "product-code",
          text: product.code
        });

        const name = createElement("span", {
          className: "product-name",
          text: product.name
        });

        main.append(code, name);

        const meta = createElement("span", {
          className: "product-meta",
          text: [
            product.category,
            product.unit
          ].filter(Boolean).join(" · ")
        });

        button.append(main, meta);

        button.addEventListener("click", () => {
          onSelect(product);
        });

        fragment.appendChild(button);
      });

      container.appendChild(fragment);
    }

    renderSelectedProduct(product) {
      const container = this.elements.selectedProduct;
      container.replaceChildren();

      const label = createElement("span", {
        className: "selected-product-label",
        text: "目前商品"
      });

      const title = createElement("strong", {
        text: product
          ? `${product.code} ${product.name}`
          : "尚未選擇商品"
      });

      const description = createElement("small", {
        text: product
          ? [product.category, product.unit]
              .filter(Boolean)
              .join(" · ") || "已選擇商品"
          : "請先從上方商品列表選擇。"
      });

      container.append(label, title, description);
    }

    getPaymentStatus() {
      const checked = document.querySelector(
        'input[name="paymentStatus"]:checked'
      );

      return checked ? checked.value : "";
    }

    setFormValues(item) {
      if (!item) {
        return;
      }

      this.elements.quantity.value = String(item.quantity);
      this.elements.customerName.value = item.customerName;
      this.syncVendorPicker(item.customerName);

      const paymentInput = document.querySelector(
        `input[name="paymentStatus"][value="${CSS.escape(
          item.paymentStatus
        )}"]`
      );

      if (paymentInput) {
        paymentInput.checked = true;
      }
    }

    resetOrderForm(defaultQuantity) {
      this.elements.quantity.value = String(defaultQuantity);
      this.elements.customerName.value = "";
      this.syncVendorPicker("");

      const defaultPayment = document.querySelector(
        'input[name="paymentStatus"][value="已付款"]'
      );

      if (defaultPayment) {
        defaultPayment.checked = true;
      }
    }

    renderCart(items, callbacks) {
      const container = this.elements.cartList;
      container.replaceChildren();

      this.elements.cartCount.textContent =
        `${items.length} 筆`;

      const hasItems = items.length > 0;
      this.elements.clearCartButton.disabled = !hasItems;
      this.elements.submitAllButton.disabled = !hasItems;

      if (!hasItems) {
        container.appendChild(
          this.createEmptyState(
            "🛒",
            "購物車目前沒有商品。"
          )
        );

        this.elements.messagePreview.textContent =
          "尚無叫貨資料";

        return;
      }

      const fragment = document.createDocumentFragment();

      items.forEach((item) => {
        const card = createElement("article", {
          className: "cart-card"
        });

        const header = createElement("div", {
          className: "cart-card-header"
        });

        const title = createElement("div", {
          className: "cart-card-title"
        });

        title.append(
          createElement("strong", {
            text: `${item.productCode} ${item.productName}`
          }),
          createElement("span", {
            text: item.customerName
          })
        );

        const removeButton = createElement("button", {
          className: "icon-button danger",
          text: "刪除",
          attrs: {
            type: "button",
            "aria-label":
              `刪除 ${item.productCode} ${item.customerName}`
          }
        });

        removeButton.addEventListener("click", () => {
          callbacks.onRemove(item);
        });

        header.append(title, removeButton);

        const controls = createElement("div", {
          className: "cart-card-controls"
        });

        const quantityControl = createElement("div", {
          className: "mini-quantity-control"
        });

        const minusButton = createElement("button", {
          text: "−",
          attrs: {
            type: "button",
            "aria-label": "減少數量"
          }
        });

        const quantityValue = createElement("span", {
          text: item.quantity
        });

        const plusButton = createElement("button", {
          text: "＋",
          attrs: {
            type: "button",
            "aria-label": "增加數量"
          }
        });

        minusButton.addEventListener("click", () => {
          callbacks.onQuantityChange(
            item,
            Math.max(1, item.quantity - 1)
          );
        });

        plusButton.addEventListener("click", () => {
          callbacks.onQuantityChange(
            item,
            item.quantity + 1
          );
        });

        quantityControl.append(
          minusButton,
          quantityValue,
          plusButton
        );

        const paymentSelect = createElement("select", {
          className: "cart-payment-select",
          attrs: {
            "aria-label":
              `${item.productCode} 的付款方式`
          }
        });

        global.APP_CONFIG.PAYMENT_STATUSES.forEach((status) => {
          const option = createElement("option", {
            text: status,
            attrs: {
              value: status
            }
          });

          option.selected = status === item.paymentStatus;
          paymentSelect.appendChild(option);
        });

        paymentSelect.addEventListener("change", () => {
          callbacks.onPaymentChange(
            item,
            paymentSelect.value
          );
        });

        controls.append(quantityControl, paymentSelect);
        card.append(header, controls);
        fragment.appendChild(card);
      });

      container.appendChild(fragment);

      this.elements.messagePreview.textContent =
        utils.buildLineMessage(items);
    }

  setAddButtonMode(mode) {
    this.elements.addToCartButton.disabled = false;

    this.elements.addToCartButton.textContent =
        mode === "update"
            ? "更新購物車"
            : "加入購物車";
}

    setSubmitting(submitting) {
      this.elements.submitAllButton.disabled =
        submitting ||
        this.elements.cartCount.textContent.startsWith("0");

      this.elements.submitAllButton.textContent =
        submitting ? "送出中…" : "送出全部";
    }

    showToast(message, state = "default") {
      const toast = this.elements.toast;

      window.clearTimeout(this.toastTimerId);

      toast.textContent = message;
      toast.dataset.state = state;
      toast.hidden = false;

      this.toastTimerId = window.setTimeout(() => {
        toast.hidden = true;
      }, 2600);
    }

    createEmptyState(icon, message) {
      const wrapper = createElement("div", {
        className: "empty-state"
      });

      wrapper.append(
        createElement("span", {
          className: "empty-state-icon",
          text: icon,
          attrs: {
            "aria-hidden": "true"
          }
        }),
        createElement("p", {
          text: message
        })
      );

      return wrapper;
    }
  }

  global.AppUI = AppUI;
})(window);
