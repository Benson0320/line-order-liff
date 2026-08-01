window.APP_CONFIG = Object.freeze({
  VERSION: "1.0.0-alpha.3",

  LIFF_ID: "2010924806-TX9pddUE",

  WEB_APP_URL:
    "https://script.google.com/macros/s/AKfycbwTmqIRLp9aqxuMVe6StBK7mFMFVumj45J_fKMwjEnCKI3r9VUXtLUerqfE7OI7S-KY/exec",

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