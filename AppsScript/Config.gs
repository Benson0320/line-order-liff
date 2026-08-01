/**
 * LINE Hair Salon Ordering System
 * Apps Script 設定
 *
 * 安全原則：
 * - LIFF ID 與 Web App URL 可以公開。
 * - Channel Secret、Channel Access Token 不可放入 GitHub Pages。
 * - 此檔案不可覆蓋既有 LINE Bot 的敏感設定。
 */

var LHO_CONFIG = Object.freeze({
  VERSION: "1.0.0-alpha.3",

  API_ACTIONS: Object.freeze({
    PRODUCTS: "liffGetProducts",
    HEALTH: "health"
  }),

  DEFAULT_CATEGORY: "其他",

  /**
   * 若既有專案有 MenuService，系統會優先使用 MenuService，
   * 不需要設定工作表名稱。
   *
   * 若沒有 MenuService，才會使用下方工作表設定。
   */
  PRODUCT_SHEET_NAMES: Object.freeze([
    "PRODUCT_MASTER",
    "商品主檔",
    "商品",
    "產品",
    "Products"
  ]),

  PRODUCT_HEADERS: Object.freeze({
    CODE: Object.freeze([
      "商品代號",
      "產品代號",
      "商品編號",
      "產品編號",
      "代號",
      "編號",
      "productId",
      "productCode",
      "code",
      "id"
    ]),

    NAME: Object.freeze([
      "商品名稱",
      "產品名稱",
      "品名",
      "名稱",
      "productName",
      "name"
    ]),

    UNIT: Object.freeze([
      "單位",
      "unit"
    ]),

    CATEGORY: Object.freeze([
      "分類",
      "類別",
      "category"
    ]),

    ENABLED: Object.freeze([
      "啟用",
      "是否啟用",
      "有效",
      "enabled",
      "active"
    ]),

    SORT: Object.freeze([
      "排序",
      "順序",
      "sort",
      "order"
    ])
  }),

  TRUE_VALUES: Object.freeze([
    true,
    1,
    "1",
    "TRUE",
    "true",
    "Y",
    "y",
    "YES",
    "yes",
    "是",
    "啟用",
    "有效"
  ]),

  FALSE_VALUES: Object.freeze([
    false,
    0,
    "0",
    "FALSE",
    "false",
    "N",
    "n",
    "NO",
    "no",
    "否",
    "停用",
    "無效"
  ])
});
