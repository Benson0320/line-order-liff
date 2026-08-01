/**
 * LINE Hair Salon Ordering System
 * 商品資料讀取層
 *
 * 相容順序：
 * 1. 優先使用既有 MenuService.getDisplayProducts()
 * 2. 若 MenuService 不存在，才直接讀取 Google Sheet
 */

function lhoGetEnabledProducts_() {
  var products = [];

  if (typeof MenuService === "function") {
    products = lhoGetProductsFromMenuService_();
  } else {
    products = lhoGetProductsFromSheet_();
  }

  return lhoNormalizeAndSortProducts_(products);
}

function lhoGetProductsFromMenuService_() {
  var menuService = new MenuService();

  if (
    !menuService ||
    typeof menuService.getDisplayProducts !== "function"
  ) {
    throw new Error(
      "MenuService 存在，但沒有 getDisplayProducts()。"
    );
  }

  var products = menuService.getDisplayProducts();

  if (!Array.isArray(products)) {
    throw new Error(
      "MenuService.getDisplayProducts() 回傳內容不是陣列。"
    );
  }

  return products.map(function(product) {
    return {
      code:
        product.productId ||
        product.productCode ||
        product.code ||
        product.id ||
        "",
      name:
        product.name ||
        product.productName ||
        "",
      unit: product.unit || "",
      category:
        product.category ||
        LHO_CONFIG.DEFAULT_CATEGORY,
      sort: Number(product.sort || 0)
    };
  });
}

function lhoGetProductsFromSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("無法取得目前 Google 試算表。");
  }

  var sheet = lhoFindProductSheet_(spreadsheet);

  if (!sheet) {
    throw new Error(
      "找不到商品工作表。請確認工作表名稱或既有 MenuService。"
    );
  }

  var values = sheet.getDataRange().getDisplayValues();

  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];

  var codeIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.CODE
  );

  var nameIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.NAME
  );

  var unitIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.UNIT
  );

  var categoryIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.CATEGORY
  );

  var enabledIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.ENABLED
  );

  var sortIndex = lhoFindHeaderIndex_(
    headers,
    LHO_CONFIG.PRODUCT_HEADERS.SORT
  );

  if (codeIndex < 0 || nameIndex < 0) {
    throw new Error(
      "商品工作表缺少商品代號或商品名稱欄位。"
    );
  }

  return values
    .slice(1)
    .map(function(row) {
      return {
        code: row[codeIndex],
        name: row[nameIndex],
        unit: unitIndex >= 0 ? row[unitIndex] : "",
        category:
          categoryIndex >= 0
            ? row[categoryIndex]
            : LHO_CONFIG.DEFAULT_CATEGORY,
        enabled:
          enabledIndex >= 0
            ? row[enabledIndex]
            : true,
        sort:
          sortIndex >= 0
            ? Number(row[sortIndex] || 0)
            : 0
      };
    })
    .filter(function(product) {
      return lhoIsEnabledValue_(product.enabled);
    });
}

function lhoFindProductSheet_(spreadsheet) {
  var configuredNames = LHO_CONFIG.PRODUCT_SHEET_NAMES;

  for (var index = 0; index < configuredNames.length; index += 1) {
    var sheet = spreadsheet.getSheetByName(configuredNames[index]);

    if (sheet) {
      return sheet;
    }
  }

  /**
   * 最後備援：
   * 尋找第一個同時含有「商品代號」及「商品名稱」類型欄位的工作表。
   */
  var sheets = spreadsheet.getSheets();

  for (var sheetIndex = 0; sheetIndex < sheets.length; sheetIndex += 1) {
    var currentSheet = sheets[sheetIndex];

    if (currentSheet.getLastRow() < 1) {
      continue;
    }

    var lastColumn = currentSheet.getLastColumn();

    if (lastColumn < 1) {
      continue;
    }

    var headers = currentSheet
      .getRange(1, 1, 1, lastColumn)
      .getDisplayValues()[0];

    var codeIndex = lhoFindHeaderIndex_(
      headers,
      LHO_CONFIG.PRODUCT_HEADERS.CODE
    );

    var nameIndex = lhoFindHeaderIndex_(
      headers,
      LHO_CONFIG.PRODUCT_HEADERS.NAME
    );

    if (codeIndex >= 0 && nameIndex >= 0) {
      return currentSheet;
    }
  }

  return null;
}

function lhoNormalizeAndSortProducts_(products) {
  var productMap = {};

  products.forEach(function(rawProduct) {
    var code = lhoNormalizeText_(
      rawProduct.code ||
      rawProduct.productCode ||
      rawProduct.productId ||
      rawProduct.id
    ).toUpperCase();

    var name = lhoNormalizeText_(
      rawProduct.name ||
      rawProduct.productName
    );

    if (!code || !name) {
      return;
    }

    /**
     * 商品代號視為唯一。
     * 若資料重複，後讀到的資料覆蓋前一筆。
     */
    productMap[code] = {
      code: code,
      name: name,
      unit: lhoNormalizeText_(rawProduct.unit),
      category:
        lhoNormalizeText_(rawProduct.category) ||
        LHO_CONFIG.DEFAULT_CATEGORY,
      sort: Number(rawProduct.sort || 0)
    };
  });

  return Object.keys(productMap)
    .map(function(code) {
      return productMap[code];
    })
    .sort(function(left, right) {
      return lhoNaturalCompare_(left.code, right.code);
    });
}
