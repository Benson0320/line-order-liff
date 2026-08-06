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

(async () => {
  // 成功刪除：確認送出的參數正確
  {
    const { window, document } = buildWindow({ success: true });
    const context = { window, document, URL, Map, console };
    vm.createContext(context);
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "..", "js", "api.js"), "utf8"),
      context
    );

    const payload = await window.ProductApi.deleteOrder(
      "verified-token",
      "設計師甲",
      "A001",
      "小明"
    );

    assert.strictEqual(payload.success, true);

    const params = new URL(document.lastScriptUrl).searchParams;
    assert.strictEqual(params.get("action"), "liffDeleteOrder");
    assert.strictEqual(params.get("accessToken"), "verified-token");
    assert.strictEqual(params.get("designerName"), "設計師甲");
    assert.strictEqual(params.get("productCode"), "A001");
    assert.strictEqual(params.get("customerName"), "小明");
  }

  // 缺少 accessToken 時不得送出請求
  {
    const { window, document } = buildWindow({ success: true });
    const context = { window, document, URL, Map, console };
    vm.createContext(context);
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "..", "js", "api.js"), "utf8"),
      context
    );

    await assert.rejects(
      () => window.ProductApi.deleteOrder("", "設計師甲", "A001", "小明")
    );
  }

  // 後端回傳失敗時要拋出對應訊息
  {
    const { window, document } = buildWindow({
      success: false,
      message: "找不到這筆叫貨，可能已被刪除，請重新整理。"
    });
    const context = { window, document, URL, Map, console };
    vm.createContext(context);
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "..", "js", "api.js"), "utf8"),
      context
    );

    await assert.rejects(
      () => window.ProductApi.deleteOrder(
        "verified-token",
        "設計師甲",
        "A001",
        "小明"
      ),
      /找不到這筆叫貨/
    );
  }

  console.log("DeleteOrderApi.test.js PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
