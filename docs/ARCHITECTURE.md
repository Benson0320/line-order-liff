# ARCHITECTURE.md

## 1. 系統概觀

```text
┌─────────────────────┐
│ LINE 群組            │
└──────────┬──────────┘
           │ 開啟 LIFF
           ▼
┌─────────────────────┐
│ GitHub Pages         │
│ LIFF Frontend        │
└──────────┬──────────┘
           │ fetch()
           ▼
┌─────────────────────┐
│ Google Apps Script   │
│ JSON API             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Google Sheet         │
│ 商品與既有統計資料   │
└─────────────────────┘
```

送出訂單時：

```text
LIFF Frontend
  ↓ liff.sendMessages()
LINE 群組
  ↓
既有 LINE Bot
  ↓
既有 Apps Script 邏輯
  ↓
Google Sheet / Excel
```

## 2. 前端責任

GitHub Pages 前端負責：

- LIFF 初始化
- 取得商品 API
- 商品排序
- 商品搜尋
- UI 顯示
- 購物車管理
- 驗證每筆數量介於 1～99
- 驗證客戶名稱不含半形或全形數字
- 唯一鍵判斷
- 覆蓋數量與付款
- 組合固定 LINE 訊息
- 呼叫 `liff.sendMessages()`

前端不負責：

- 儲存 Channel Secret
- 儲存 Channel Access Token
- 直接修改 Google Sheet
- 重新實作既有 Bot 統計邏輯

## 3. Apps Script API 責任

- 讀取商品工作表
- 將商品轉為 JSON
- 欄位相容處理
- 分類欄位預留
- 錯誤回傳
- CORS 相容的公開 Web App 輸出
- 提供目前叫貨唯讀 JSON，排除 LINE User ID

## 4. LINE Bot 責任

既有 Bot 繼續負責：

- 解析固定文字格式
- 使用者或群組識別
- 統計開始
- 統計結束
- 重新開放
- 寫入 Google Sheet
- Excel 產出

## 5. 資料流

### 商品讀取

```text
頁面啟動
  ↓
GET ?action=liffGetProducts
  ↓
Apps Script
  ↓
Google Sheet 商品工作表
  ↓
JSON
  ↓
前端排序與顯示
```

### 訂單送出

```text
購物車
  ↓
轉換為固定文字
  ↓
liff.sendMessages()
  ↓
LINE 群組
  ↓
原 Bot
```

### 總叫貨讀取

```text
總叫貨頁面
  ↓ GET ?action=liffGetCurrentOrders
Apps Script 唯讀 ORDERS
  ↓
依設計師分組顯示目前叫貨
```

## 6. 部署

前端：

- GitHub Pages
- HTTPS
- LIFF Endpoint 指向 GitHub Pages URL

後端：

- Google Apps Script Web App
- 執行身分：擁有者
- 存取權限：任何人

## 7. 安全邊界

可公開：

- LIFF ID
- Apps Script Web App URL

不可公開：

- LINE Channel Secret
- LINE Channel Access Token
- 私密憑證
- 管理者密碼
