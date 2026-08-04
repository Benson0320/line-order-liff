(function startApplication(global) {
  "use strict";

  const config = global.APP_CONFIG;
  const utils = global.AppUtils;
  const api = global.ProductApi;

  class HairOrderingApp {
    constructor() {
      this.ui = new global.AppUI();
      this.cart = new global.CartStore(
        config.STORAGE_KEYS.CART
      );

      this.products = [];
      this.filteredProducts = [];
      this.selectedProduct = null;
      this.activeCategory = "全部商品";
      this.searchKeyword = "";
      this.profile = null;
      this.isInClient = false;
      this.isSubmitting = false;
    }

    async init() {
      this.bindEvents();
      this.cart.subscribe((items) => {
        this.renderCart(items);
        this.updateAddButtonMode();
      });

      this.renderCart(this.cart.getItems());

      this.ui.setStatus(
        "正在初始化 LIFF",
        "請稍候，正在確認 LINE 使用環境。",
        "loading"
      );

      try {
        await this.initializeLiff();
        await this.loadProducts();

        this.ui.setControlsEnabled(true);
        this.ui.setStatus(
          "叫貨介面已就緒",
          `已載入 ${this.products.length} 項商品。`,
          "success"
        );

        window.setTimeout(() => {
          this.ui.setStatusHidden(true);
        }, 1200);
      } catch (error) {
        console.error(error);

        this.ui.setConnectionBadge("初始化失敗", "error");
        this.ui.setStatus(
          "系統初始化失敗",
          error.message || String(error),
          "error"
        );
      }
    }

    bindEvents() {
      const elements = this.ui.elements;

      elements.productSearch.addEventListener(
        "input",
        utils.debounce(() => {
          this.searchKeyword =
            elements.productSearch.value;
          this.applyProductFilters();
        }, 120)
      );

      elements.decreaseQuantity.addEventListener(
        "click",
        () => {
          elements.quantity.value = String(
            utils.clampInteger(
              Number(elements.quantity.value) - 1,
              1,
              config.MAX_QUANTITY
            )
          );
        }
      );

      elements.increaseQuantity.addEventListener(
        "click",
        () => {
          elements.quantity.value = String(
            utils.clampInteger(
              Number(elements.quantity.value) + 1,
              1,
              config.MAX_QUANTITY
            )
          );
        }
      );

      elements.quantity.addEventListener(
        "change",
        () => {
          elements.quantity.value = String(
            utils.clampInteger(
              elements.quantity.value,
              1,
              config.MAX_QUANTITY
            )
          );
        }
      );

      elements.customerName.addEventListener(
        "input",
        () => {
          this.updateAddButtonMode();
        }
      );

      document
        .querySelectorAll(
          'input[name="paymentStatus"]'
        )
        .forEach((input) => {
          input.addEventListener("change", () => {
            this.updateAddButtonMode();
          });
        });

      elements.addToCartButton.addEventListener(
        "click",
        () => this.handleAddToCart()
      );

      elements.clearCartButton.addEventListener(
        "click",
        () => this.handleClearCart()
      );

      elements.submitAllButton.addEventListener(
        "click",
        () => this.handleSubmitAll()
      );
    }

    async initializeLiff() {
      if (typeof global.liff === "undefined") {
        throw new Error(
          "LIFF SDK 載入失敗，請檢查網路連線。"
        );
      }

      await utils.withTimeout(
        global.liff.init({
          liffId: config.LIFF_ID
        }),
        config.REQUEST_TIMEOUT_MS,
        "LIFF 初始化"
      );

      this.isInClient = global.liff.isInClient();

      this.ui.setConnectionBadge(
        this.isInClient ? "LINE 內開啟" : "一般瀏覽器",
        this.isInClient ? "success" : "warning"
      );

      if (!global.liff.isLoggedIn()) {
        if (this.isInClient) {
          throw new Error(
            "LINE 登入狀態異常，請重新開啟 LIFF。"
          );
        }

        global.liff.login({
          redirectUri: window.location.href
        });

        return;
      }

      try {
        this.profile = await utils.withTimeout(
          global.liff.getProfile(),
          8000,
          "取得 LINE 使用者資料"
        );
      } catch (error) {
        console.warn("取得 LINE 使用者資料失敗：", error);
      }
    }

    async loadProducts() {
      this.ui.setStatus(
        "正在載入商品",
        "正在從 Google Sheet 取得商品資料。",
        "loading"
      );

      this.products = await api.getProducts();
      this.applyProductFilters();
      this.renderCategories();
    }

    renderCategories() {
      const categories = [
        ...new Set(
          this.products
            .map((product) => product.category)
            .filter(Boolean)
        )
      ].sort(utils.naturalCompare);

      this.ui.renderCategories(
        categories,
        this.activeCategory,
        (category) => {
          this.activeCategory = category;
          this.applyProductFilters();
          this.renderCategories();
        }
      );
    }

    applyProductFilters() {
      const keyword = utils.normalizeSearchText(
        this.searchKeyword
      );

      const isUnfilteredDefaultView =
        this.activeCategory === "全部商品" &&
        !keyword &&
        this.products.length >
          config.PRODUCT_LIST_AUTO_SHOW_LIMIT;

      if (isUnfilteredDefaultView) {
        this.filteredProducts = [];

        this.ui.renderProducts(
          [],
          this.selectedProduct?.code || "",
          (product) => this.selectProduct(product),
          {
            totalCount: this.products.length,
            emptyIcon: "🔍",
            emptyMessage:
              `共 ${this.products.length} 項商品，` +
              "請選擇上方分類，或輸入關鍵字搜尋。"
          }
        );
        return;
      }

      this.filteredProducts = this.products.filter(
        (product) => {
          const matchCategory =
            this.activeCategory === "全部商品" ||
            product.category === this.activeCategory;

          if (!matchCategory) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          const searchTarget =
            utils.normalizeSearchText(
              `${product.code} ${product.name}`
            );

          return searchTarget.includes(keyword);
        }
      );

      this.ui.renderProducts(
        this.filteredProducts,
        this.selectedProduct?.code || "",
        (product) => this.selectProduct(product),
        { totalCount: this.products.length }
      );
    }

    selectProduct(product) {
      this.selectedProduct = product;

      this.ui.renderSelectedProduct(product);
      this.ui.elements.quantity.value = String(
        config.DEFAULT_QUANTITY
      );

      this.applyProductFilters();
      this.updateAddButtonMode();

      this.ui.elements.quantity.focus({
        preventScroll: false
      });
      this.ui.elements.quantity.select();
    }

    getFormData() {
      if (!this.selectedProduct) {
        throw new Error("請先選擇商品。");
      }

      const quantityResult =
        utils.validateQuantity(
          this.ui.elements.quantity.value,
          config.MAX_QUANTITY
        );

      if (!quantityResult.valid) {
        throw new Error(quantityResult.message);
      }

      const customerResult =
        utils.validateCustomerName(
          this.ui.elements.customerName.value
        );

      if (!customerResult.valid) {
        throw new Error(customerResult.message);
      }

      const paymentStatus =
        this.ui.getPaymentStatus();

      if (
        !config.PAYMENT_STATUSES.includes(
          paymentStatus
        )
      ) {
        throw new Error("付款方式不正確。");
      }

      return {
        productCode: this.selectedProduct.code,
        productName: this.selectedProduct.name,
        unit: this.selectedProduct.unit,
        quantity: quantityResult.value,
        paymentStatus,
        customerName: customerResult.value
      };
    }

    handleAddToCart() {
      try {
        const orderData = this.getFormData();
        const result = this.cart.upsert(orderData);

        const actionText =
          result.mode === "updated"
            ? "已覆蓋原有資料"
            : "已加入購物車";

        this.ui.showToast(
          `${orderData.productCode}／${orderData.customerName} ${actionText}`,
          "success"
        );

        this.ui.elements.quantity.value = String(
          config.DEFAULT_QUANTITY
        );
      } catch (error) {
        this.ui.showToast(
          error.message || String(error),
          "error"
        );
      }
    }

    handleClearCart() {
      if (this.cart.size === 0) {
        return;
      }

      const confirmed = window.confirm(
        "確定要清空本次叫貨資料嗎？"
      );

      if (!confirmed) {
        return;
      }

      this.cart.clear();
      this.ui.showToast("購物車已清空。");
    }

    renderCart(items) {
      this.ui.renderCart(items, {
        onRemove: (item) => {
          this.cart.removeById(item.id);
          this.ui.showToast(
            `${item.productCode} 已刪除。`
          );
        },
        onQuantityChange: (item, quantity) => {
          const validQuantity =
            utils.clampInteger(
              quantity,
              1,
              config.MAX_QUANTITY
            );

          this.cart.updateById(item.id, {
            quantity: validQuantity
          });
        },
        onPaymentChange: (item, paymentStatus) => {
          if (
            !config.PAYMENT_STATUSES.includes(
              paymentStatus
            )
          ) {
            return;
          }

          this.cart.updateById(item.id, {
            paymentStatus
          });
        }
      });
    }

    updateAddButtonMode() {
      if (!this.selectedProduct) {
        this.ui.setAddButtonMode("create");
        return;
      }

      const customerName = utils.normalizeText(
        this.ui.elements.customerName.value
      );

      if (!customerName) {
        this.ui.setAddButtonMode("create");
        return;
      }

      const key = utils.createCartKey(
        this.selectedProduct.code,
        customerName
      );

      this.ui.setAddButtonMode(
        this.cart.findByKey(key)
          ? "update"
          : "create"
      );
    }

    async handleSubmitAll() {
      if (this.isSubmitting) {
        return;
      }

      const items = this.cart.getItems();

      if (items.length === 0) {
        this.ui.showToast(
          "購物車目前沒有資料。",
          "error"
        );
        return;
      }

      if (!this.isInClient) {
        this.ui.showToast(
          "請從 LINE 群組內開啟 LIFF 後再送出。",
          "error"
        );
        return;
      }

      const message = utils.buildLineMessage(items);

      this.isSubmitting = true;
      this.ui.setSubmitting(true);

      try {
        await utils.withTimeout(
          global.liff.sendMessages([
            {
              type: "text",
              text: message
            }
          ]),
          config.SEND_TIMEOUT_MS,
          "LINE 訊息送出"
        );

        this.cart.clear();
        this.ui.showToast(
          "叫貨資料已送出。",
          "success"
        );

        window.setTimeout(() => {
          global.liff.closeWindow();
        }, 650);
      } catch (error) {
        console.error(error);

        this.ui.showToast(
          `送出失敗：${error.message || error}`,
          "error"
        );
      } finally {
        this.isSubmitting = false;
        this.ui.setSubmitting(false);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const app = new HairOrderingApp();
    app.init();
  });
})(window);
