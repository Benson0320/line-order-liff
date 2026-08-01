const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const window = {
  APP_CONFIG: {
    WEB_APP_URL: "https://example.com/exec",
    REQUEST_TIMEOUT_MS: 12000,
    CURRENT_ORDERS_TIMEOUT_MS: 8000,
    DEFAULT_CATEGORY: "其他",
    API_ACTIONS: {
      PRODUCTS: "liffGetProducts",
      CURRENT_ORDERS: "liffGetCurrentOrders",
      HEALTH: "health"
    }
  },
  AppUtils: {
    sanitizeProduct: () => null,
    naturalCompare: () => 0
  },
  setTimeout,
  clearTimeout
};

const document = {
  lastScriptUrl: "",
  appendCount: 0,
  createElement: () => ({ remove() {} }),
  head: {
    appendChild(script) {
      document.appendCount += 1;
      document.lastScriptUrl = script.src;
      if (document.appendCount === 1) {
        script.onerror();
        return;
      }
      const url = new URL(script.src);
      const callback = url.searchParams.get("callback");
      window[callback]({
        success: true,
        scope: "own",
        orders: [{ designerName: "小美", quantity: 5 }],
        totalQuantity: 5,
        updatedAt: "2026-08-01T00:00:00.000Z"
      });
    }
  }
};

const context = { window, document, URL, Map, console };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "..", "js", "api.js"), "utf8"),
  context
);

(async () => {
  const payload = await window.ProductApi.getCurrentOrders("verified-token");
  assert.strictEqual(payload.orders.length, 1);
  assert.strictEqual(payload.totalQuantity, 5);
  assert.strictEqual(document.appendCount, 2);
  assert.strictEqual(
    new URL(document.lastScriptUrl).searchParams.get("accessToken"),
    "verified-token"
  );
  console.log("CurrentOrdersApi.test.js PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
