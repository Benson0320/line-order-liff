(function startCurrentOrdersPage(global) {
  "use strict";

  const api = global.ProductApi;
  const config = global.APP_CONFIG;
  const utils = global.AppUtils;
  let accessTokenPromise = null;
  let hasCachedPayload = false;
  const elements = {
    badge: document.getElementById("connectionBadge"),
    pageTitle: document.getElementById("pageTitle"),
    statusPanel: document.getElementById("statusPanel"),
    statusTitle: document.getElementById("statusTitle"),
    statusMessage: document.getElementById("statusMessage"),
    designerCount: document.getElementById("designerCount"),
    orderCount: document.getElementById("orderCount"),
    totalQuantity: document.getElementById("totalQuantity"),
    updatedAt: document.getElementById("updatedAt"),
    list: document.getElementById("currentOrders"),
    refreshButton: document.getElementById("refreshButton")
  };

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function groupOrders(orders) {
    return orders.reduce((groups, order) => {
      const name = String(order.designerName || "").trim();
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(order);
      return groups;
    }, new Map());
  }

  function renderOrders(orders) {
    const groups = groupOrders(orders);
    const fragment = document.createDocumentFragment();

    if (orders.length === 0) {
      const empty = createElement("div", "empty-state", "目前尚無叫貨資料。");
      elements.list.replaceChildren(empty);
      return groups.size;
    }

    groups.forEach((designerOrders, designerName) => {
      const section = createElement("section", "designer-order-group", "");
      const heading = createElement("div", "designer-order-heading", "");
      heading.append(
        createElement("strong", "", designerName),
        createElement("span", "count-badge", `${designerOrders.length} 筆`)
      );
      section.appendChild(heading);

      designerOrders.forEach((order) => {
        const card = createElement("article", "current-order-card", "");
        const header = createElement("div", "current-order-card-header", "");
        const title = createElement(
          "strong",
          "current-order-title",
          `${order.productCode} ${order.productName}`
        );
        const deleteButton = createElement(
          "button",
          "icon-button danger current-order-delete",
          "刪除"
        );
        deleteButton.type = "button";
        deleteButton.setAttribute(
          "aria-label",
          `刪除 ${order.designerName} 的 ${order.productCode}｜${order.customerName || "未填客戶"}`
        );
        deleteButton.addEventListener("click", () => {
          handleDeleteOrder(order, deleteButton);
        });
        header.append(title, deleteButton);

        const detail = createElement(
          "p",
          "current-order-detail",
          `${order.quantity} 份｜${order.paymentStatus || "未設定"}｜${order.customerName || "未填客戶"}`
        );
        card.append(header, detail);
        section.appendChild(card);
      });

      fragment.appendChild(section);
    });

    elements.list.replaceChildren(fragment);
    return groups.size;
  }

  async function handleDeleteOrder(order, buttonElement) {
    const confirmed = global.confirm(
      `確定要刪除「${order.designerName}」的「${order.productCode} ${order.productName}」`
      + `（客戶：${order.customerName || "未填客戶"}）嗎？`
    );

    if (!confirmed) return;

    buttonElement.disabled = true;
    buttonElement.textContent = "刪除中…";

    try {
      const accessToken = await getVerifiedAccessToken();
      if (!accessToken) return;

      await api.deleteOrder(
        accessToken,
        order.designerName,
        order.productCode,
        order.customerName
      );

      await loadCurrentOrders();
    } catch (error) {
      global.alert(error.message || String(error));
      buttonElement.disabled = false;
      buttonElement.textContent = "刪除";
    }
  }

  async function getVerifiedAccessToken() {
    if (accessTokenPromise) return accessTokenPromise;

    accessTokenPromise = initializeVerifiedAccessToken();

    try {
      return await accessTokenPromise;
    } catch (error) {
      accessTokenPromise = null;
      throw error;
    }
  }

  async function initializeVerifiedAccessToken() {
    if (typeof global.liff === "undefined") {
      throw new Error("LIFF SDK 載入失敗，請檢查網路連線。");
    }

    await utils.withTimeout(
      global.liff.init({ liffId: global.APP_CONFIG.LIFF_ID }),
      config.LIFF_INIT_TIMEOUT_MS,
      "LIFF 初始化"
    );

    if (!global.liff.isLoggedIn()) {
      global.liff.login({ redirectUri: window.location.href });
      return null;
    }

    const accessToken = global.liff.getAccessToken();
    if (!accessToken) {
      throw new Error("無法取得 LINE 登入驗證，請重新開啟頁面。");
    }

    return accessToken;
  }

  async function getCurrentOrdersCacheKey(accessToken) {
    if (!global.crypto?.subtle || typeof TextEncoder === "undefined") return null;

    const digest = await global.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(accessToken)
    );
    const fingerprint = Array.from(new Uint8Array(digest))
      .slice(0, 12)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");

    return `${config.STORAGE_KEYS.CURRENT_ORDERS}:${fingerprint}`;
  }

  function readCachedPayload(cacheKey) {
    if (!cacheKey) return null;

    try {
      const cached = JSON.parse(
        sessionStorage.getItem(cacheKey) || "null"
      );
      if (
        !cached
        || !Array.isArray(cached.payload?.orders)
        || Date.now() - cached.cachedAt > config.CURRENT_ORDERS_CACHE_MS
      ) return null;
      return cached.payload;
    } catch (error) {
      return null;
    }
  }

  function cachePayload(cacheKey, payload) {
    if (!cacheKey) return;

    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ payload, cachedAt: Date.now() })
      );
    } catch (error) {
      // 快取失敗不影響正式資料顯示
    }
  }

  function renderPayload(payload) {
    applyScope(payload.scope);
    const designerCount = renderOrders(payload.orders);
    elements.designerCount.textContent = String(designerCount);
    elements.orderCount.textContent = String(payload.orders.length);
    elements.totalQuantity.textContent = String(payload.totalQuantity || 0);
    elements.updatedAt.textContent = `更新時間：${new Date(payload.updatedAt).toLocaleString("zh-TW")}`;
  }

  function applyScope(scope) {
    const isAdminView = scope === "all";
    elements.pageTitle.textContent = isAdminView
      ? "📋 總叫貨"
      : "📋 我的總叫貨";
    document.getElementById("currentOrdersTitle").textContent = isAdminView
      ? "全部目前叫貨"
      : "我的目前叫貨";
  }

  async function loadCurrentOrders() {
    elements.refreshButton.disabled = true;
    elements.badge.textContent = "讀取中";
    elements.statusPanel.hidden = false;
    elements.statusPanel.dataset.state = "loading";
    elements.statusTitle.textContent = "正在讀取目前叫貨";
    elements.statusMessage.textContent = "請稍候，正在取得最新資料。";

    try {
      const accessToken = await getVerifiedAccessToken();
      if (!accessToken) return;

      const cacheKey = await getCurrentOrdersCacheKey(accessToken);
      const cachedPayload = readCachedPayload(cacheKey);

      if (!hasCachedPayload && cachedPayload) {
        renderPayload(cachedPayload);
        hasCachedPayload = true;
        elements.badge.textContent = "更新中";
      }

      const payload = await api.getCurrentOrders(accessToken);
      renderPayload(payload);
      cachePayload(cacheKey, payload);
      hasCachedPayload = true;
      elements.badge.textContent = payload.scope === "all"
        ? "管理員"
        : "個人資料";
      elements.badge.dataset.state = "success";
      elements.statusPanel.hidden = true;
    } catch (error) {
      elements.badge.textContent = hasCachedPayload ? "顯示上次資料" : "讀取失敗";
      elements.badge.dataset.state = hasCachedPayload ? "warning" : "error";
      elements.statusPanel.dataset.state = hasCachedPayload ? "warning" : "error";
      elements.statusTitle.textContent = hasCachedPayload
        ? "最新資料暫時無法取得"
        : "目前叫貨讀取失敗";
      elements.statusMessage.textContent = hasCachedPayload
        ? "已保留上次成功資料，可稍後重新整理。"
        : error.message || String(error);
    } finally {
      elements.refreshButton.disabled = false;
    }
  }

  elements.refreshButton.addEventListener("click", loadCurrentOrders);
  document.addEventListener("DOMContentLoaded", () => {
    loadCurrentOrders();
  });
})(window);
