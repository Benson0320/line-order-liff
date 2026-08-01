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

  async function requestJson(action, params = {}) {
    const url = buildApiUrl(action, params);

    const request = fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow"
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`API 回應錯誤：HTTP ${response.status}`);
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (error) {
        throw new Error("API 回傳內容不是有效 JSON。");
      }
    });

    return utils.withTimeout(
      request,
      config.REQUEST_TIMEOUT_MS,
      "商品 API"
    );
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
    const payload = await requestJson(
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
    return requestJson(config.API_ACTIONS.HEALTH);
  }

  global.ProductApi = Object.freeze({
    getProducts,
    healthCheck,
    buildApiUrl,
    normalizeProducts
  });
})(window);
