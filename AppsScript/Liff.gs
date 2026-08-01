/************************************************
 * Liff.gs
 * SalonOS / LINE Hair Salon Ordering System
 *
 * 整合目的：
 * 1. 保留既有 Apps Script HTML LIFF 頁面路由
 * 2. 提供 GitHub Pages 使用的商品 JSON API
 * 3. 提供健康檢查 API
 * 4. 不影響既有 doPost(e)、LINE Webhook、統計與 Excel
 *
 * 支援 action：
 * - health
 * - liffGetProducts
 * - liffProducts（舊版相容）
 * - liffPage（舊版 Apps Script HTML 相容）
 ************************************************/

const LIFF_ID = "2010924806-TX9pddUE";
const LIFF_API_VERSION = "1.0.0-alpha.3";

//================================
// GET 路由入口
// 專案內只保留這一個 doGet(e)
//================================
function doGet(e) {
    const action =
        e && e.parameter
            ? String(e.parameter.action || "").trim()
            : "";

    const callback =
        e && e.parameter
            ? String(e.parameter.callback || "").trim()
            : "";

    if (action === "health") {
        return liffHealthResponse_(callback);
    }

    if (
        action === "liffGetProducts"
        ||
        action === "liffProducts"
    ) {
        return liffProductsResponse_(callback);
    }

    if (action === "liffPage") {
        return liffPageResponse_();
    }

    return liffJsonResponse_({
        success: false,
        version: LIFF_API_VERSION,
        error: "UNKNOWN_ACTION",
        message: "不支援的 action：" + action
    }, callback);
}

//================================
// 健康檢查
//================================
function liffHealthResponse_(callback) {
    return liffJsonResponse_({
        success: true,
        version: LIFF_API_VERSION,
        service: "line-hair-ordering-system",
        timestamp: new Date().toISOString()
    }, callback);
}

//================================
// 供舊版 google.script.run 呼叫
//================================
function liffGetProducts() {
    return getEnabledProductsForLiff_();
}

//================================
// 商品清單 JSON
// GitHub Pages fetch() 使用
//================================
function liffProductsResponse_(callback) {
    try {
        const products =
            getEnabledProductsForLiff_();

        writeLog(
            "LIFF",
            "商品清單讀取成功；Count="
            +
            products.length
        );

        return liffJsonResponse_({
            success: true,
            version: LIFF_API_VERSION,
            products: products,
            count: products.length
        }, callback);
    }
    catch (error) {
        try {
            writeLog(
                "LIFF",
                "商品清單讀取失敗；Error="
                +
                String(
                    error && error.message
                        ? error.message
                        : error
                )
            );
        }
        catch (logError) {
            Logger.log(
                "LIFF 商品清單讀取失敗"
            );
        }

        return liffJsonResponse_({
            success: false,
            version: LIFF_API_VERSION,
            error: "PRODUCTS_LOAD_FAILED",
            message: "商品資料讀取失敗。"
        }, callback);
    }
}

//================================
// 讀取啟用商品
//
// 直接沿用既有 MenuService：
// - PRODUCT_MASTER
// - Enabled 過濾
// - 空名稱過濾
//
// LIFF API 再依 ProductID 做自然排序，
// 符合前端「依代號排序」規格。
//================================
function getEnabledProductsForLiff_() {
    const menuService =
        new MenuService();

    const products =
        menuService.getDisplayProducts();

    const normalizedProducts =
        products.map((product) => {
            const productId =
                String(
                    product.productId || ""
                ).trim();

            const name =
                String(
                    product.name || ""
                ).trim();

            return {
                code: productId,
                productId: productId,
                name: name,
                unit: String(
                    product.unit || ""
                ).trim(),
                category:
                    String(
                        product.category || ""
                    ).trim()
                    ||
                    "其他",
                sort:
                    Number.isFinite(
                        Number(product.sort)
                    )
                    ?
                    Number(product.sort)
                    :
                    0
            };
        })
        .filter((product) => (
            product.code
            &&
            product.name
        ));

    const productMap = new Map();

    normalizedProducts.forEach(
        (product) => {
            // ProductID 視為唯一，後值覆蓋前值
            productMap.set(
                product.code,
                product
            );
        }
    );

    return Array.from(
        productMap.values()
    ).sort(
        (left, right) => (
            naturalCompareProductCode_(
                left.code,
                right.code
            )
        )
    );
}

//================================
// 商品代號自然排序
// A01, A2, A10, B01
//================================
function naturalCompareProductCode_(
    leftValue,
    rightValue
) {
    const left =
        String(leftValue || "")
        .trim()
        .toUpperCase();

    const right =
        String(rightValue || "")
        .trim()
        .toUpperCase();

    const leftParts =
        left.match(/\d+|\D+/g)
        ||
        [left];

    const rightParts =
        right.match(/\d+|\D+/g)
        ||
        [right];

    const length =
        Math.max(
            leftParts.length,
            rightParts.length
        );

    for (
        let index = 0;
        index < length;
        index++
    ) {
        const leftPart =
            leftParts[index];

        const rightPart =
            rightParts[index];

        if (
            typeof leftPart
            ===
            "undefined"
        ) {
            return -1;
        }

        if (
            typeof rightPart
            ===
            "undefined"
        ) {
            return 1;
        }

        const leftIsNumber =
            /^\d+$/.test(leftPart);

        const rightIsNumber =
            /^\d+$/.test(rightPart);

        if (
            leftIsNumber
            &&
            rightIsNumber
        ) {
            const difference =
                Number(leftPart)
                -
                Number(rightPart);

            if (difference !== 0) {
                return difference;
            }
        }
        else if (
            leftPart !== rightPart
        ) {
            return (
                leftPart < rightPart
                    ? -1
                    : 1
            );
        }
    }

    return 0;
}

//================================
// 舊版 Apps Script HTML LIFF 頁面
// 過渡期保留，不影響 GitHub Pages
//================================
function liffPageResponse_() {
    const template =
        HtmlService
        .createTemplateFromFile(
            "LiffPage"
        );

    template.liffId =
        LIFF_ID;

    template.webAppUrl =
        ScriptApp
        .getService()
        .getUrl();

    return template
        .evaluate()
        .setTitle(
            "叫貨系統"
        )
        .addMetaTag(
            "viewport",
            "width=device-width, initial-scale=1"
        );
}

//================================
// JSON 回應
//================================
function liffJsonResponse_(payload, callback) {
    const json =
        JSON.stringify(payload);

    if (callback) {
        if (
            !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)
        ) {
            return ContentService
                .createTextOutput(
                    JSON.stringify({
                        success: false,
                        version: LIFF_API_VERSION,
                        error: "INVALID_CALLBACK",
                        message: "callback 格式不正確。"
                    })
                )
                .setMimeType(
                    ContentService.MimeType.JSON
                );
        }

        return ContentService
            .createTextOutput(
                callback
                +
                "("
                +
                json
                +
                ");"
            )
            .setMimeType(
                ContentService
                .MimeType
                .JAVASCRIPT
            );
    }

    return ContentService
        .createTextOutput(json)
        .setMimeType(
            ContentService.MimeType.JSON
        );
}
