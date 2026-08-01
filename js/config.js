window.APP_CONFIG = Object.freeze({
  VERSION: "1.0.0-alpha.3",

  LIFF_ID: "2010924806-TX9pddUE",

  WEB_APP_URL:
    "https://script.google.com/macros/s/AKfycby4NK1nVX5aWYmTzArORvk7mMEgZ3dRR-10wtx2h6UjLBot0yr7opzfeAeMLXVyU7P_/exec",

  API_ACTIONS: Object.freeze({
    PRODUCTS: "liffGetProducts",
    CURRENT_ORDERS: "liffGetCurrentOrders",
    HEALTH: "health"
  }),

  PAYMENT_STATUSES: Object.freeze([
    "已付款",
    "未付款",
    "自領"
  ]),

  DEFAULT_CATEGORY: "其他",
  DEFAULT_QUANTITY: 1,
  MAX_QUANTITY: 99,
  REQUEST_TIMEOUT_MS: 12000,
  CURRENT_ORDERS_TIMEOUT_MS: 8000,
  CURRENT_ORDERS_CACHE_MS: 300000,
  SEND_TIMEOUT_MS: 12000,

  STORAGE_KEYS: Object.freeze({
    CART: "lineHairOrdering.cart.v1",
    CURRENT_ORDERS: "lineHairOrdering.currentOrders.v1",
    RECENT_PRODUCTS: "lineHairOrdering.recentProducts.v1"
  })
});
