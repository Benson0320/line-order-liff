# AI_CONTEXT.md

## 1. 專案定位

本專案名稱為 **LINE Hair Salon Ordering System**。

本專案是提供美髮沙龍設計師使用的 LINE 叫貨與進貨管理系統，**不是餐飲點餐系統**。

所有 AI、工程師與維護者在修改程式前，必須先閱讀本文件，以及：

- `docs/PRODUCT_SPEC.md`
- `docs/BUSINESS_RULE.md`
- `docs/ARCHITECTURE.md`
- `docs/TEST_CASE.md`

## 2. 核心目標

目前 V1 的主要目標：

1. 讓設計師可從 LINE 群組開啟 LIFF 圖形介面。
2. 從既有 Google Sheet 讀取商品資料。
3. 支援商品搜尋與依商品代號排序。
4. 支援一次加入多個商品。
5. 支援付款狀態：
   - 已付款
   - 未付款
   - 自領
6. 支援客戶名稱。
7. 送出後維持既有 LINE Bot 可解析的固定格式。
8. 提供叫貨狀況唯讀頁面；一般設計師只看自己，管理員可看全部。

固定格式：

```text
A02 10 已付款 小明
```

多筆資料時，每筆一行：

```text
A02 10 已付款 小明
A08 2 自領 小華
```

## 3. 技術架構

前端：

- GitHub Pages
- LIFF v2
- HTML
- CSS
- JavaScript ES6

後端：

- Google Apps Script
- Google Sheets
- LINE Messaging API
- Apps Script 更新固定沿用既有 Web App deployment ID，使 `js/config.js` 的 `WEB_APP_URL` 保持不變

流程：

```text
LINE 群組
  ↓
LIFF URL
  ↓
GitHub Pages
  ↓
Google Apps Script API
  ↓
Google Sheet
  ↓
LINE Bot 既有流程
```

## 4. 核心商業規則

### 4.1 商品排序

商品必須依商品代號排序，例如：

```text
A01
A02
A03
A10
B01
```

不可改為依商品名稱排序。

### 4.2 商品唯一性

商品代號在商品資料中視為唯一識別值。

### 4.3 購物車唯一鍵

購物車每筆資料的唯一鍵為：

```text
商品代號 + 客戶名稱
```

### 4.4 覆蓋規則

若再次加入相同商品代號且客戶名稱相同：

- 覆蓋數量
- 覆蓋付款方式
- 不新增重複資料
- 不累加數量

例如：

第一次：

```text
A02 10 已付款 小明
```

第二次：

```text
A02 5 自領 小明
```

每筆商品數量必須介於 1～99；覆蓋後仍不得超過 99。

客戶名稱不得包含半形或全形數字，避免被誤認為下一筆商品數量。

結果：

```text
A02 5 自領 小明
```

### 4.5 不同客戶

若商品相同但客戶不同，必須保留為不同資料：

```text
A02 10 已付款 小明
A02 5 自領 小華
```

### 4.6 付款方式

只支援：

- 已付款
- 未付款
- 自領

未經使用者明確要求，不可新增其他付款方式。

## 5. 向下相容規則

不可破壞：

- 現有 LINE Bot
- 現有 Google Sheet
- 統計開始
- 統計結束
- 重新開放
- Excel 匯出
- 既有文字解析流程
- 固定 LINE 訊息格式

所有新功能都應以擴充方式加入，不應推翻既有流程。

## 6. V1 不包含

V1 不做：

- 商品價格
- 備註
- 餐飲點餐功能
- 折扣
- 優惠券
- 會員系統
- 庫存扣帳
- 管理者後台
- 商品圖片

## 7. UI 原則

- Mobile First
- 適合 LINE 內建瀏覽器
- 觸控按鈕尺寸足夠
- 操作步驟簡單
- 支援深色模式
- 支援 30～100 項商品
- 搜尋商品代號或名稱
- 可一次加入多個商品
- 可修改數量
- 可刪除單筆
- 可清空全部
- 送出前顯示預覽
- 可切換到「叫貨狀況」；一般設計師查看自己資料，管理員查看全部資料

## 8. 程式規範

前端：

- 使用原生 ES6 JavaScript
- 使用 `async/await`
- 使用 `fetch()`
- 不使用 jQuery
- 不使用 React
- 不使用 Vue
- 不使用外部 UI Framework

安全：

- 不可將 Channel Secret 放在前端
- 不可將 Channel Access Token 放在前端
- 不可將任何私密金鑰提交到 GitHub
- 所有輸入必須驗證
- 避免使用未經處理的 `innerHTML`

## 9. 文件同步規則

修改核心規則時，必須同步更新：

- `AI_CONTEXT.md`
- `docs/PRODUCT_SPEC.md`
- `docs/BUSINESS_RULE.md`
- `docs/DECISION_LOG.md`
- `docs/TEST_CASE.md`
- `docs/CHANGELOG.md`
- `docs/VERSION.md`

## 10. AI 工作規則

任何 AI 在修改程式前必須：

1. 先閱讀本文件。
2. 確認不會破壞既有 LINE Bot。
3. 確認不會改變固定 LINE 訊息格式。
4. 確認不會改變「商品代號 + 客戶名稱」唯一鍵。
5. 確認同商品同客戶採覆蓋，不是累加。
6. 提供完整檔案，不只提供片段。
7. 說明修改檔案與測試方式。
