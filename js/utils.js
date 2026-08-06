(function exposeUtils(global) {
  "use strict";

  function normalizeText(value) {
    return String(value ?? "").trim();
  }

  function normalizeSearchText(value) {
    return normalizeText(value).toLocaleLowerCase("zh-Hant");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function naturalCompare(left, right) {
    return normalizeText(left).localeCompare(
      normalizeText(right),
      "zh-Hant",
      {
        numeric: true,
        sensitivity: "base"
      }
    );
  }

  function clampInteger(value, min, max) {
    const parsed = Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed)) {
      return min;
    }

    return Math.min(max, Math.max(min, parsed));
  }

  function createCartKey(productCode, customerName) {
    return [
      normalizeText(productCode).toUpperCase(),
      normalizeText(customerName)
    ].join("::");
  }

  function validateCustomerName(value) {
    const customerName = normalizeText(value);

    if (!customerName) {
      return {
        valid: false,
        message: "請輸入客戶名稱。"
      };
    }

    return {
      valid: true,
      value: customerName
    };
  }

  function validateQuantity(value, maxQuantity) {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return {
        valid: false,
        message: "數量必須是大於 0 的整數。"
      };
    }

    if (quantity > maxQuantity) {
      return {
        valid: false,
        message: `數量不可超過 ${maxQuantity}。`
      };
    }

    return {
      valid: true,
      value: quantity
    };
  }

  function withTimeout(promise, milliseconds, label) {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(
          new Error(
            `${label || "操作"}超過 ${milliseconds / 1000} 秒仍未完成。`
          )
        );
      }, milliseconds);
    });

    return Promise.race([promise, timeoutPromise])
      .finally(() => window.clearTimeout(timeoutId));
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("JSON 解析失敗：", error);
      return fallback;
    }
  }

  function storageGet(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return safeJsonParse(value, fallback);
    } catch (error) {
      console.warn("讀取 localStorage 失敗：", error);
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("寫入 localStorage 失敗：", error);
      return false;
    }
  }

  function storageRemove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("刪除 localStorage 失敗：", error);
      return false;
    }
  }

  function buildLineMessage(cartItems) {
    return cartItems
      .map((item) => {
        return [
          normalizeText(item.productCode),
          Number(item.quantity),
          normalizeText(item.paymentStatus),
          normalizeText(item.customerName)
        ].join(" ");
      })
      .join("\n");
  }

  function sanitizeProduct(rawProduct, defaultCategory) {
    const code = normalizeText(
      rawProduct?.code ??
      rawProduct?.productCode ??
      rawProduct?.id
    ).toUpperCase();

    const name = normalizeText(
      rawProduct?.name ??
      rawProduct?.productName
    );

    if (!code || !name) {
      return null;
    }

    return {
      code,
      name,
      unit: normalizeText(rawProduct?.unit),
      category:
        normalizeText(rawProduct?.category) ||
        normalizeText(defaultCategory) ||
        "其他"
    };
  }

  function debounce(callback, delay) {
    let timerId;

    return function debounced(...args) {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => callback.apply(this, args), delay);
    };
  }

  function generateId(prefix) {
    const random = Math.random().toString(36).slice(2, 9);
    return `${prefix || "id"}-${Date.now()}-${random}`;
  }

  global.AppUtils = Object.freeze({
    normalizeText,
    normalizeSearchText,
    escapeRegExp,
    naturalCompare,
    clampInteger,
    createCartKey,
    validateCustomerName,
    validateQuantity,
    withTimeout,
    safeJsonParse,
    storageGet,
    storageSet,
    storageRemove,
    buildLineMessage,
    sanitizeProduct,
    debounce,
    generateId
  });
})(window);
