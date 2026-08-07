const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function buildWindow(responsePayload) {
  const window = {
    APP_CONFIG: {
      WEB_APP_URL: "https://example.com/exec",
      REQUEST_TIMEOUT_MS: 12000,
      PRODUCTS_TIMEOUT_MS: 20000,
      DEFAULT_CATEGORY: "其他",
      API_ACTIONS: {
        PRODUCTS: "liffGetProducts",
        CURRENT_ORDERS: "liffGetCurrentOrders",
        DELETE_ORDER: "liffDeleteOrder",
        VENDOR_ACCESS: "liffCheckVendorAccess",
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
    createElement: () => ({ remove() {} }),
    head: {
      appendChild(script) {
        document.lastScriptUrl = script.src;
        const url = new URL(script.src);
        const callback = url.searchParams.get("callback");
        window[callback](responsePayload);
      }
    }
  };

  return { window, document };
}

function loadApi(window, document) {
  const context = { window, document, URL, Map, console };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "js", "api.js"), "utf8"),
    context
  );
  return context;
}

(async () => {
  // 有權限：回傳 true，且送出的參數正確
  {
    const { window, document } = buildWindow({
      success: true,
      canUseVendorShortcuts: true
    });
    loadApi(window, document);

    const allowed =
      await window.ProductApi.checkVendorAccess("verified-token");

    assert.strictEqual(allowed, true);

    const params = new URL(document.lastScriptUrl).searchParams;
    assert.strictEqual(params.get("action"), "liffCheckVendorAccess");
    assert.strictEqual(params.get("accessToken"), "verified-token");
  }

  // 一般設計師：後端回傳 false
  {
    const { window, document } = buildWindow({
      success: true,
      canUseVendorShortcuts: false
    });
    loadApi(window, document);

    const allowed =
      await window.ProductApi.checkVendorAccess("verified-token");

    assert.strictEqual(allowed, false);
  }

  // 缺少 accessToken：不得送出請求，直接回傳 false
  {
    const { window, document } = buildWindow({
      success: true,
      canUseVendorShortcuts: true
    });
    loadApi(window, document);

    const allowed = await window.ProductApi.checkVendorAccess("");

    assert.strictEqual(allowed, false);
    assert.strictEqual(document.lastScriptUrl, "");
  }

  // 後端拒絕（例如 UNAUTHORIZED）：失敗一律視為沒有權限，不拋錯
  {
    const { window, document } = buildWindow({
      success: false,
      error: "UNAUTHORIZED",
      message: "LINE 登入驗證失敗，請重新開啟頁面。"
    });
    loadApi(window, document);

    const allowed =
      await window.ProductApi.checkVendorAccess("verified-token");

    assert.strictEqual(allowed, false);
  }

  console.log("VendorAccessApi.test.js PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
