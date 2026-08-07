/**
 * 驗證叫貨頁面（index.html）真的能跑完一輪 init()。
 *
 * test/*.test.js 只測試個別函式，不會載入真正的 index.html 或執行
 * app.js 的 init() 流程，所以無法抓到「新版 JS 操作舊版 HTML 沒有的
 * 元素」這類問題（見 AI_CONTEXT.md 8.1.1、8.1.2）。這支腳本用 jsdom
 * 載入實際的 index.html，依序執行真正的 config.js / utils.js /
 * cart.js / ui.js / app.js，只 stub 掉 LIFF SDK（無法在 Node 裡連上
 * 真的 LINE）與 ProductApi（避免依賴真的網路 JSONP），其餘全部是
 * 正式程式碼。
 *
 * 用法：
 *   npm install   （第一次執行需要，安裝 jsdom）
 *   npm run verify
 *
 * 修改 js/ 或 index.html 之後、push 之前，應該先跑一次這支腳本。
 * 通過不代表 LINE 內建瀏覽器一定正常（無法模擬真正的 LIFF 環境與
 * 手機裝置快取），但至少能抓到會讓 init() 整個掛掉的明顯錯誤。
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const repoDir = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(repoDir, "index.html"), "utf8");

function runOnce() {
  const dom = new JSDOM(html, {
    url: "https://benson0320.github.io/line-order-liff/index.html",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });

  const { window } = dom;

  window.liff = {
    init: async () => {},
    isInClient: () => true,
    isLoggedIn: () => true,
    getProfile: async () => ({ displayName: "測試設計師" }),
    getAccessToken: () => "test-access-token",
    login: () => {
      throw new Error("liff.login() 不應該在 isLoggedIn()=true 時被呼叫");
    }
  };

  const windowErrors = [];
  window.addEventListener("error", (event) => {
    windowErrors.push(event.error || event.message);
  });

  function runLocalScript(relativePath) {
    const code = fs.readFileSync(path.join(repoDir, relativePath), "utf8");
    dom.window.eval(code);
  }

  runLocalScript("js/config.js");
  runLocalScript("js/utils.js");

  // 真正的 api.js 用 JSONP 打 Apps Script，在這裡沒有網路可用，
  // 直接 stub 成 app.js 實際會用到的形狀。
  window.ProductApi = {
    getProducts: async () => [
      { code: "A001", name: "測試商品一", category: "宣尼1", unit: "" },
      { code: "A002", name: "測試商品二", category: "宣尼1", unit: "" }
    ],
    getCurrentOrders: async () => ({ orders: [] }),
    // 模擬有廠商快選權限，讓 setupVendorPicker() 實際跑過
    // renderVendorPicker() 那條路徑，而不是只測到失敗時的靜默隱藏。
    checkVendorAccess: async () => true,
    healthCheck: async () => ({ success: true })
  };

  runLocalScript("js/cart.js");
  runLocalScript("js/ui.js");
  runLocalScript("js/app.js");

  return { window, windowErrors };
}

(async () => {
  const { window, windowErrors } = runOnce();

  // app.js 在 DOMContentLoaded 時觸發 init()，不等待它完成；
  // 用輪詢等待狀態離開初始／載入中文字，而不是猜一個固定延遲。
  const deadline = Date.now() + 5000;

  while (Date.now() < deadline) {
    const current = window.document.getElementById("statusTitle").textContent;

    if (current !== "正在準備叫貨介面" && current !== "正在載入商品") {
      break;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  const statusTitle = window.document.getElementById("statusTitle").textContent;
  const statusMessage = window.document.getElementById("statusMessage").textContent;
  const productCount = window.document.getElementById("productCount").textContent;

  console.log("statusTitle:", JSON.stringify(statusTitle));
  console.log("statusMessage:", JSON.stringify(statusMessage));
  console.log("productCount:", JSON.stringify(productCount));

  if (statusTitle !== "叫貨介面已就緒") {
    throw new Error(
      "init() 沒有在時限內走到成功狀態，statusTitle="
      + statusTitle
      + " statusMessage="
      + statusMessage
    );
  }

  if (windowErrors.length > 0) {
    throw new Error(
      "init() 過程中有未處理的 window error 事件："
      + windowErrors.map(String).join("; ")
    );
  }

  // setupVendorPicker() 是 fire-and-forget（見 app.js init()），
  // 可能在 statusTitle 更新之後才完成，這裡再輪詢等一下，
  // 確保「有權限時快選按鈕真的會渲染」這條路徑也有被跑過、沒有拋錯。
  const vendorPickerDeadline = Date.now() + 2000;

  while (Date.now() < vendorPickerDeadline) {
    if (window.document.getElementById("vendorPicker").children.length > 0) {
      break;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  if (windowErrors.length > 0) {
    throw new Error(
      "setupVendorPicker() 過程中有未處理的 window error 事件："
      + windowErrors.map(String).join("; ")
    );
  }

  if (window.document.getElementById("vendorPicker").children.length === 0) {
    throw new Error(
      "有廠商快選權限時 renderVendorPicker() 應該要渲染按鈕，"
      + "但 vendorPicker 目前是空的"
    );
  }

  // 順便驗證客戶名稱可以輸入數字（不拋錯、不被攔截）。
  const customerNameInput = window.document.getElementById("customerName");
  customerNameInput.value = "網美 10 大學生";
  customerNameInput.dispatchEvent(new window.Event("input"));

  if (windowErrors.length > 0) {
    throw new Error(
      "客戶名稱輸入數字時發生 window error："
      + windowErrors.map(String).join("; ")
    );
  }

  console.log("PASS: index.html 完整跑過一輪 init()，無 JS 錯誤");
})().catch((error) => {
  console.error("FAIL:", error);
  process.exitCode = 1;
});
