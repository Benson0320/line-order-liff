# Apps Script Milestone 3 合併說明

## 1. 此資料夾內容

```text
AppsScript/
├── Config.gs
├── Utils.gs
├── Sheet.gs
├── Api.gs
├── Liff.gs
└── README-MERGE.md
```

## 2. 不要破壞既有 LINE Bot

這些檔案只新增：

- 商品 JSON API
- 健康檢查 API
- Google Sheet 商品欄位相容
- GitHub Pages 使用的 GET 路由

不應修改：

- `doPost(e)`
- LINE Webhook
- 統計開始
- 統計結束
- Excel 匯出
- 既有訂單寫入
- 既有文字解析

## 3. doGet(e) 只能有一個

Apps Script 專案中，全域 `doGet(e)` 只能保留一個。

### 情況 A：目前沒有 doGet(e)

直接加入本資料夾的 `Liff.gs`。

### 情況 B：目前只有舊版 Liff.gs 的 doGet(e)

可直接用本資料夾的 `Liff.gs` 取代舊版 LIFF 路由。

新版本仍相容：

```text
?action=liffProducts
```

同時新增正式 action：

```text
?action=liffGetProducts
?action=health
```

### 情況 C：其他檔案也有 doGet(e)

不要直接覆蓋。

將原本 `doGet(e)` 開頭加入：

```javascript
var action =
  e && e.parameter
    ? lhoNormalizeText_(e.parameter.action)
    : "";

if (
  action === "liffGetProducts" ||
  action === "liffProducts" ||
  action === "health"
) {
  return lhoHandleApiRequest_(action, e);
}
```

然後保留原本其他路由。

## 4. 商品讀取優先順序

### 第一優先：既有 MenuService

若專案有：

```javascript
new MenuService().getDisplayProducts()
```

新 API 會直接沿用，不重寫商品主檔邏輯。

支援欄位：

```text
productId
productCode
code
id
name
productName
unit
category
sort
```

### 第二優先：直接讀取工作表

如果沒有 MenuService，會搜尋：

```text
PRODUCT_MASTER
商品主檔
商品
產品
Products
```

也會自動偵測含商品代號、商品名稱標題的工作表。

## 5. 分類欄位

目前 Google Sheet 沒有分類也沒關係。

API 會回傳：

```json
{
  "category": "其他"
}
```

未來新增「分類」欄位後，前端會自動顯示分類。

## 6. 部署

加入檔案後：

```text
部署
→ 管理部署作業
→ 編輯
→ 新版本
→ 部署
```

設定：

```text
執行身分：我
誰可以存取：任何人
```

## 7. API 測試

瀏覽器開啟：

```text
WEB_APP_URL?action=health
```

預期：

```json
{
  "success": true,
  "version": "1.0.0-alpha.3",
  "service": "line-hair-ordering-system"
}
```

商品：

```text
WEB_APP_URL?action=liffGetProducts
```

預期：

```json
{
  "success": true,
  "products": [
    {
      "code": "A01",
      "name": "商品名稱",
      "unit": "瓶",
      "category": "其他",
      "sort": 0
    }
  ]
}
```
