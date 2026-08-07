window.APP_CONFIG = Object.freeze({
  VERSION: "1.0.0-alpha.3",

  LIFF_ID: "2010924806-TX9pddUE",

  WEB_APP_URL:
    "https://script.google.com/macros/s/AKfycbxujO8qDn4ZpqqcEeL4Ohc33qmT1I8Yj6ehy8NRU7zf5hgalLg13n7WZ2PNgJhfcRmJ1w/exec",

  API_ACTIONS: Object.freeze({
    PRODUCTS: "liffGetProducts",
    CURRENT_ORDERS: "liffGetCurrentOrders",
    DELETE_ORDER: "liffDeleteOrder",
    VENDOR_ACCESS: "liffCheckVendorAccess",
    HEALTH: "health"
  }),

  PAYMENT_STATUSES: Object.freeze([
    "已付款",
    "未付款",
    "自領"
  ]),

  // 廠商客戶名稱快選。
  //
  // 同步維護：Apps Script 端 Line_bot_V1_FAYE 的 src/Constants.gs
  // 也有一份 ORDER_VENDOR_CUSTOMER_NAMES，報表會依那份名單各自輸出
  // 獨立工作表。增減廠商時兩邊必須一起修改，否則這裡選得到的廠商
  // 在報表不會獨立成表，或報表多出這裡選不到的廠商。
  //
  // 這份清單本身不分權限，但畫面上是否顯示快選按鈕由後端
  // liffCheckVendorAccess（管理員或組長）決定，見 app.js
  // setupVendorPicker()；一般設計師看不到也選不到。
  VENDOR_CUSTOMER_NAMES: Object.freeze([
    "宣尼",
    "覺亞",
    "醫美",
    "麥偉",
    "耐克斯",
    "施華蔻",
    "伊日",
    "川越",
    "I-Charming",
    "BIO"
  ]),

  DEFAULT_CATEGORY: "其他",
  PRODUCT_LIST_AUTO_SHOW_LIMIT: 30,
  DEFAULT_QUANTITY: 1,
  MAX_QUANTITY: 99,
  REQUEST_TIMEOUT_MS: 12000,
  LIFF_INIT_TIMEOUT_MS: 20000,
  PRODUCTS_TIMEOUT_MS: 20000,
  CURRENT_ORDERS_TIMEOUT_MS: 8000,
  CURRENT_ORDERS_CACHE_MS: 300000,
  SEND_TIMEOUT_MS: 12000,

  STORAGE_KEYS: Object.freeze({
    CART: "lineHairOrdering.cart.v1",
    CURRENT_ORDERS: "lineHairOrdering.currentOrders.v1",
    RECENT_PRODUCTS: "lineHairOrdering.recentProducts.v1"
  })
});
