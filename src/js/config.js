window.APP_CONFIG = Object.freeze({
  VERSION: "1.0.0-alpha.2",

  // 請在正式部署前確認此 LIFF ID。
  LIFF_ID: "2010924806-TX9pddUE",

  // Milestone 3 完成 Apps Script API 後，請替換成正式 Web App URL。
  WEB_APP_URL:
    "https://script.google.com/macros/s/AKfycbzot-sYDX-k3D1bLvrWn1New0oG_Grglomg0a9yonOKG8X0LT7pMWoOhOeS4yzx45wO/exec",

  API_ACTIONS: Object.freeze({
    PRODUCTS: "liffGetProducts",
    HEALTH: "health"
  }),

  PAYMENT_STATUSES: Object.freeze([
    "已付款",
    "未付款",
    "自領"
  ]),

  DEFAULT_CATEGORY: "其他",
  DEFAULT_QUANTITY: 1,
  MAX_QUANTITY: 9999,
  REQUEST_TIMEOUT_MS: 12000,
  SEND_TIMEOUT_MS: 12000,
  STORAGE_KEYS: Object.freeze({
    CART: "lineHairOrdering.cart.v1",
    RECENT_PRODUCTS: "lineHairOrdering.recentProducts.v1"
  })
});
