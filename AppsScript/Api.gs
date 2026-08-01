/**
 * LINE Hair Salon Ordering System
 * 公開 JSON API
 */

function lhoHandleApiRequest_(action, event) {
  switch (action) {
    case LHO_CONFIG.API_ACTIONS.PRODUCTS:
    case "liffProducts":
      return lhoProductsResponse_();

    case LHO_CONFIG.API_ACTIONS.HEALTH:
      return lhoHealthResponse_();

    default:
      return lhoErrorResponse_(
        "UNKNOWN_ACTION",
        "不支援的 action：" + lhoNormalizeText_(action)
      );
  }
}

function lhoProductsResponse_() {
  try {
    var products = lhoGetEnabledProducts_();

    lhoWriteLog_(
      "API",
      "商品清單讀取成功",
      {
        count: products.length
      }
    );

    return lhoSuccessResponse_({
      products: products,
      count: products.length
    });
  } catch (error) {
    var message = lhoSafeErrorMessage_(error);

    lhoWriteLog_(
      "API",
      "商品清單讀取失敗",
      {
        message: message
      }
    );

    return lhoErrorResponse_(
      "PRODUCTS_LOAD_FAILED",
      "商品資料讀取失敗。",
      message
    );
  }
}

function lhoHealthResponse_() {
  return lhoSuccessResponse_({
    service: "line-hair-ordering-system",
    timestamp: new Date().toISOString()
  });
}

/**
 * 保留給 Apps Script 內部或舊 HTML Service 呼叫。
 * GitHub Pages 前端使用 GET API。
 */
function liffGetProducts() {
  return lhoGetEnabledProducts_();
}
