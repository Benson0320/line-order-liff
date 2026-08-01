(function startCurrentOrdersPage(global) {
  "use strict";

  const api = global.ProductApi;
  const elements = {
    badge: document.getElementById("connectionBadge"),
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
        const title = createElement(
          "strong",
          "current-order-title",
          `${order.productCode} ${order.productName}`
        );
        const detail = createElement(
          "p",
          "current-order-detail",
          `${order.quantity} 份｜${order.paymentStatus || "未設定"}｜${order.customerName || "未填客戶"}`
        );
        card.append(title, detail);
        section.appendChild(card);
      });

      fragment.appendChild(section);
    });

    elements.list.replaceChildren(fragment);
    return groups.size;
  }

  async function loadCurrentOrders() {
    elements.refreshButton.disabled = true;
    elements.badge.textContent = "讀取中";
    elements.statusPanel.hidden = false;
    elements.statusPanel.dataset.state = "loading";
    elements.statusTitle.textContent = "正在讀取目前叫貨";
    elements.statusMessage.textContent = "請稍候，正在取得最新資料。";

    try {
      const payload = await api.getCurrentOrders();
      const designerCount = renderOrders(payload.orders);
      elements.designerCount.textContent = String(designerCount);
      elements.orderCount.textContent = String(payload.orders.length);
      elements.totalQuantity.textContent = String(payload.totalQuantity || 0);
      elements.updatedAt.textContent = `更新時間：${new Date(payload.updatedAt).toLocaleString("zh-TW")}`;
      elements.badge.textContent = "已更新";
      elements.badge.dataset.state = "success";
      elements.statusPanel.hidden = true;
    } catch (error) {
      elements.badge.textContent = "讀取失敗";
      elements.badge.dataset.state = "error";
      elements.statusPanel.dataset.state = "error";
      elements.statusTitle.textContent = "目前叫貨讀取失敗";
      elements.statusMessage.textContent = error.message || String(error);
    } finally {
      elements.refreshButton.disabled = false;
    }
  }

  elements.refreshButton.addEventListener("click", loadCurrentOrders);
  document.addEventListener("DOMContentLoaded", loadCurrentOrders);
})(window);
