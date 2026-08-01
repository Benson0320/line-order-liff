# API.md

## 1. 基本網址

```text
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## 2. 健康檢查

### Request

```http
GET /exec?action=health
```

### Response

```json
{
  "success": true,
  "version": "1.0.0-alpha.3",
  "service": "line-hair-ordering-system",
  "timestamp": "2026-08-01T00:00:00.000Z"
}
```

## 3. 取得商品

### 正式 action

```http
GET /exec?action=liffGetProducts
```

### 舊版相容 action

```http
GET /exec?action=liffProducts
```

### Success Response

```json
{
  "success": true,
  "version": "1.0.0-alpha.3",
  "products": [
    {
      "code": "A01",
      "name": "洗髮精",
      "unit": "瓶",
      "category": "洗髮",
      "sort": 0
    }
  ],
  "count": 1
}
```

### Error Response

```json
{
  "success": false,
  "version": "1.0.0-alpha.3",
  "error": "PRODUCTS_LOAD_FAILED",
  "message": "商品資料讀取失敗。",
  "details": "實際錯誤資訊"
}
```

## 4. 商品資料來源

API 依序使用：

1. `MenuService.getDisplayProducts()`
2. Google Sheet 商品工作表

## 5. 商品欄位相容

商品代號：

- 商品代號
- 產品代號
- 商品編號
- 代號
- productId
- productCode
- code
- id

商品名稱：

- 商品名稱
- 產品名稱
- 品名
- 名稱
- productName
- name

選填欄位：

- 單位
- 分類
- 啟用
- 排序

## 6. 訂單送出

V1 不使用 Apps Script submit API。

前端使用：

```javascript
liff.sendMessages()
```

傳回 LINE 群組，再由原 Bot 處理。

固定格式：

```text
A02 10 已付款 小明
```

## 7. 相容規則

- 不修改既有 `doPost(e)`。
- Apps Script 只能有一個 `doGet(e)`。
- 不可刪除舊版 `liffProducts` 相容 action，除非確認沒有舊前端使用。
- `products` 必須保持陣列。
- `code` 與 `name` 必須存在。
- `unit`、`category` 可為空或預設值。
