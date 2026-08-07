(function exposeApi(global) {
  "use strict";

  const config = global.APP_CONFIG;
  const utils = global.AppUtils;

  function buildApiUrl(action, params = {}) {
    const url = new URL(config.WEB_APP_URL);

    url.searchParams.set("action", action);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  function requestJsonp(
    action,
    params = {},
    timeoutMs = config.REQUEST_TIMEOUT_MS
  ) {
    return new Promise((resolve, reject) => {
      const callbackName =
        "__lhoJsonp_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 9);

      const script = document.createElement("script");
      const url = buildApiUrl(action, {
        ...params,
        callback: callbackName,
        _: Date.now()
      });

      let timeoutId;

      function cleanup() {
        window.clearTimeout(timeoutId);
        script.remove();

        try {
          delete global[callbackName];
        } catch (error) {
          global[callbackName] = undefined;
        }
      }

      global[callbackName] = (payload) => {
        cleanup();
        resolve(payload);
      };

      script.src = url;
      script.async = true;
      script.referrerPolicy = "no-referrer";

      script.onerror = () => {
        cleanup();
        reject(
          new Error(
            "商品 API 載入失敗，請確認 Apps Script 已部署為任何人可存取。"
          )
        );
      };

      timeoutId = window.setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `資料 API 超過 ${timeoutMs / 1000} 秒仍未回應。`
          )
        );
      }, timeoutMs);

      document.head.appendChild(script);
    });
  }

  function normalizeProducts(payload) {
    const rawProducts = Array.isArray(payload)
      ? payload
      : payload?.products;

    if (!Array.isArray(rawProducts)) {
      throw new Error("商品 API 回傳格式錯誤。");
    }

    const productMap = new Map();

    rawProducts.forEach((rawProduct) => {
      const product = utils.sanitizeProduct(
        rawProduct,
        config.DEFAULT_CATEGORY
      );

      if (!product) {
        return;
      }

      productMap.set(product.code, product);
    });

    return [...productMap.values()].sort((left, right) => {
      return utils.naturalCompare(left.code, right.code);
    });
  }

  async function getProducts() {
    let payload;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        payload = await requestJsonp(
          config.API_ACTIONS.PRODUCTS,
          {},
          config.PRODUCTS_TIMEOUT_MS
        );
        break;
      } catch (error) {
        if (attempt === 1) throw error;
        await new Promise((resolve) => global.setTimeout(resolve, 500));
      }
    }

    if (payload?.success === false) {
      throw new Error(
        payload.message || "商品資料讀取失敗。"
      );
    }

    return normalizeProducts(payload);
  }

  async function healthCheck() {
    return requestJsonp(config.API_ACTIONS.HEALTH);
  }

  async function getCurrentOrders(accessToken) {
    if (!accessToken) {
      throw new Error("缺少 LINE 登入驗證，請重新開啟頁面。");
    }

    let payload;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        payload = await requestJsonp(
          config.API_ACTIONS.CURRENT_ORDERS,
          { accessToken },
          config.CURRENT_ORDERS_TIMEOUT_MS
        );
        break;
      } catch (error) {
        if (attempt === 1) throw error;
        await new Promise((resolve) => global.setTimeout(resolve, 500));
      }
    }

    if (payload?.success === false) {
      throw new Error(
        payload.message || "目前叫貨資料讀取失敗。"
      );
    }

    if (!Array.isArray(payload?.orders)) {
      throw new Error("目前叫貨 API 回傳格式錯誤。");
    }

    return payload;
  }

  async function deleteOrder(
    accessToken,
    designerName,
    productCode,
    customerName
  ) {
    if (!accessToken) {
      throw new Error("缺少 LINE 登入驗證，請重新開啟頁面。");
    }

    const payload = await requestJsonp(
      config.API_ACTIONS.DELETE_ORDER,
      {
        accessToken,
        designerName,
        productCode,
        customerName
      },
      config.PRODUCTS_TIMEOUT_MS
    );

    if (payload?.success === false) {
      throw new Error(
        payload.message || "刪除叫貨失敗。"
      );
    }

    return payload;
  }

  /**
   * 廠商客戶名稱快選按鈕權限檢查；任何失敗（缺少 token、逾時、
   * 後端拒絕）都回傳 false 而非拋出例外，讓呼叫端維持預設隱藏，
   * 不影響其餘頁面初始化流程。
   */
  async function checkVendorAccess(accessToken) {
    if (!accessToken) {
      return false;
    }

    try {
      const payload = await requestJsonp(
        config.API_ACTIONS.VENDOR_ACCESS,
        { accessToken },
        config.PRODUCTS_TIMEOUT_MS
      );

      return payload?.canUseVendorShortcuts === true;
    } catch (error) {
      return false;
    }
  }

  global.ProductApi = Object.freeze({
    getProducts,
    getCurrentOrders,
    deleteOrder,
    checkVendorAccess,
    healthCheck,
    buildApiUrl,
    normalizeProducts
  });
})(window);
