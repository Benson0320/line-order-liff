/**
 * LINE Hair Salon Ordering System
 * Apps Script GET 路由入口
 *
 * 重要：
 * Apps Script 專案只能有一個全域 doGet(e)。
 * 若既有專案已經有 doGet(e)，請依 README-MERGE.md 合併路由，
 * 不可保留兩個 doGet。
 */

function doGet(e) {
  var action =
    e && e.parameter
      ? lhoNormalizeText_(e.parameter.action)
      : "";

  /**
   * GitHub Pages 前端 API。
   */
  if (action) {
    return lhoHandleApiRequest_(action, e);
  }

  /**
   * 未帶 action 時提供健康狀態，
   * 避免誤開 /exec 只看到 UNKNOWN_ACTION。
   */
  return lhoHealthResponse_();
}

/**
 * 相容舊版 Apps Script HTML 頁面路由。
 *
 * GitHub Pages 正式架構不需要 action=liffPage，
 * 但先保留函式，方便舊部署過渡。
 */
function lhoLegacyLiffPageResponse_() {
  if (
    typeof HtmlService === "undefined"
  ) {
    return lhoErrorResponse_(
      "HTML_SERVICE_UNAVAILABLE",
      "HtmlService 無法使用。"
    );
  }

  try {
    var template =
      HtmlService.createTemplateFromFile("LiffPage");

    template.liffId =
      typeof LIFF_ID !== "undefined"
        ? LIFF_ID
        : "";

    template.webAppUrl =
      ScriptApp.getService().getUrl();

    return template
      .evaluate()
      .setTitle("叫貨系統")
      .addMetaTag(
        "viewport",
        "width=device-width, initial-scale=1"
      );
  } catch (error) {
    return lhoErrorResponse_(
      "LEGACY_PAGE_FAILED",
      "舊版 LIFF 頁面輸出失敗。",
      lhoSafeErrorMessage_(error)
    );
  }
}
