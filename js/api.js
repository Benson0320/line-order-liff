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

  function requestJsonp(action, params = {}) {
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
            `商品 API 超過 ${config.REQUEST_TIMEOUT_MS / 1000} 秒仍未回應。`
          )
        );
      }, config.REQUEST_TIMEOUT_MS);

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
    const payload = await requestJsonp(
      config.API_ACTIONS.PRODUCTS
    );

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

  async function getCurrentOrders() {
    const payload = await requestJsonp(
      config.API_ACTIONS.CURRENT_ORDERS
    );

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

  global.ProductApi = Object.freeze({
    getProducts,
    getCurrentOrders,
    healthCheck,
    buildApiUrl,
    normalizeProducts
  });
})(window);
