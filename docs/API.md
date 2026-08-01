# API.md

## 1. 基本資訊

Google Apps Script Web App 作為前端商品資料 API。

基礎網址：

```text
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## 2. 取得商品

### Request

```http
GET /exec?action=liffGetProducts
```

### Success Response

```json
{
  "success": true,
  "products": [
    {
      "code": "A01",
      "name": "洗髮精",
      "unit": "瓶",
      "category": "洗髮"
    },
    {
      "code": "A02",
      "name": "護髮精",
      "unit": "瓶",
      "category": "護髮"
    }
  ]
}
```

### 欄位

| 欄位 | 必填 | 說明 |
|---|---:|---|
| code | 是 | 商品代號 |
| name | 是 | 商品名稱 |
| unit | 否 | 單位 |
| category | 否 | 分類，缺少時使用「其他」 |

### Error Response

```json
{
  "success": false,
  "message": "商品資料讀取失敗"
}
```

## 3. 健康檢查

預留：

```http
GET /exec?action=health
```

Response：

```json
{
  "success": true,
  "version": "1.0.0-alpha.1"
}
```

## 4. 送單 API

V1 主要使用：

```javascript
liff.sendMessages()
```

將固定格式文字送回 LINE 群組，不直接透過 API 寫入訂單。

因此 V1 不強制實作 `submitOrder` API。

## 5. API 相容性

- 不可任意修改 `liffGetProducts` 名稱。
- 新增欄位必須保持既有欄位。
- 前端應容許 `unit` 與 `category` 缺少。
- `products` 必須為陣列。
