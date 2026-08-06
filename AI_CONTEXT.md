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
9. 叫貨狀況需快速顯示短期快取，背景更新失敗時保留上次成功資料。

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

客戶名稱僅要求非空白，可包含半形或全形數字（見決策 D-014）。

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

## 8.1 已發生過的錯誤與規則

本節記錄實際造成正式環境故障的疏漏。修改程式前必須先確認不會重蹈覆轍。

### 8.1.1 修改 JS 或 CSS 必須同步更新 `?v=` 版本字串

`index.html` 與 `total-orders.html` 以查詢字串控制快取，例如
`./js/app.js?v=20260806a`。**只要改動 `js/` 或 `css/` 內任何檔案，就必須把兩個
HTML 內所有 `?v=` 一起換成新的日期序號**，例如 `20260806a` → `20260806b`。

漏改的後果不是「新功能沒生效」這麼單純。LINE WebView 會逐檔判斷快取，
可能出現新舊檔案混用：舊的 `index.html` 缺少新元素，新的 `js/ui.js`
卻去操作那個元素，於是拋出 TypeError。若該呼叫位於 `app.js` 的 `init()`
try 區塊內（例如 `setControlsEnabled()`），畫面會停在
「系統初始化失敗」，設計師完全無法叫貨。

2026-08-06 曾因此造成正式環境故障。修正方式為更新版本字串，
並在 `renderVendorPicker`、`syncVendorPicker`、`setControlsEnabled`
加上元素不存在時略過的防護。

### 8.1.2 新增 DOM 元素時必須容許該元素不存在

承上，使用者裝置的快取無法控制。凡是在 `init()` 流程中操作的新元素，
都要先檢查是否存在，取不到時略過該功能即可，不得讓整個初始化中斷。
少一個按鈕可以接受，整頁無法叫貨不行。

### 8.1.3 廠商客戶名稱清單需與後端同步

`js/config.js` 的 `VENDOR_CUSTOMER_NAMES` 與 Apps Script 專案
`Line_bot_V1_FAYE` 的 `src/Constants.gs` 中
`ORDER_VENDOR_CUSTOMER_NAMES` 是同一份名單，增減廠商必須兩邊一起改。
只改前端會讓該廠商在 Excel 報表不會獨立成表；只改後端則前端選不到。

### 8.1.4 修改後必須實際驗證過一次 init()，不能只跑單元測試

`test/*.test.js` 都只測試個別函式（`validateCustomerName`、購物車邏輯
等），沒有任何一個測試會真的載入 `index.html` 並執行 `app.js` 的
`init()` 流程。8.1.1 那次故障（`?v=` 版本字串沒同步）如果當時有跑過
一次真正的 init()，會立刻在 `renderVendorPicker` 操作不存在的
`#vendorPicker` 時噴錯，而不用等到正式環境才發現。

2026-08-06 客戶名稱開放數字那次修改後，使用者回報「LIFF 又加載
失敗」，但當下只跑了 `test/*.test.js`（全過）就直接 push，沒有實際
跑過 `init()`。事後用 `scripts/verify-liff-init.js`（見下方）驗證，
init() 本身完全正常、沒有任何錯誤；使用者一開始回報「載入太久」，
讓人一度誤判是 GitHub Pages CDN／裝置端快取還沒跟上（`index.html`
的 `Cache-Control: max-age=600` 是系統層級設定，無法用 8.1.1 的
meta 標籤完全蓋掉），但後來附上的截圖顯示真正原因是
`liff.init()`（LINE 官方 SDK）本身逾時：畫面顯示
「LIFF 初始化超過 12 秒仍未完成」，也就是 `app.js` 的
`initializeLiff()` 裡 `utils.withTimeout(liff.init(...), 12000, ...)`
真的等超過 12 秒。`liff.init()` 是呼叫 LINE 官方伺服器，在網路較差
時本來就可能需要更久，`scripts/verify-liff-init.js` 會 stub 掉
`liff.init()`，測不出這種真實網路延遲。

修正方式：把 LIFF 初始化的逾時從共用的 `REQUEST_TIMEOUT_MS`
（12000ms）拆成獨立的 `LIFF_INIT_TIMEOUT_MS`（20000ms），
`index.html` 與 `total-orders.html` 的登入流程都改用這個獨立設定，
不影響其他 API 呼叫的逾時。**沒有**對 `liff.init()` 做重試——
LIFF SDK 官方文件沒有明確保證 `liff.init()` 重複呼叫時的行為，
與其冒著重複初始化出現未知副作用的風險，先用拉長逾時處理。

這流程暴露出三個落差：一是「單元測試全過≠頁面能正常載入」；
二是「剛部署完的幾分鐘內測試，仍可能因為快取還沒生效而變慢或
短暫看到舊版」（這個可能性依然存在，只是這次不是真正原因）；
三是「`verify-liff-init.js` 驗證不出真實網路延遲造成的逾時，
只能抓程式邏輯錯誤」。使用者回報異常時，**先要截圖或錯誤文字**，
不要只憑一句「加載失敗」就猜原因，狀態文字（如「LIFF 初始化超過
12 秒仍未完成」）通常已經直接指出問題在哪一步。

**剛 push／redeploy 完的幾分鐘內**如果要現場測試，先預期可能要多等
一下、或看到暫時的舊版行為，不要一測到異常就當成程式碼壞掉；先確認
是不是單純還沒等到快取過期，但也不要因此忽略真正的錯誤訊息。

### 8.1.5 「資料 API 逾時」不一定是後端變慢，要對照 Apps Script 執行紀錄再下結論

同一天（2026-08-06）接著又出現「資料 API 超過 12 秒仍未回應」。一開始
猜測是當天商品從 10 筆暴增到 514 筆、讀取變慢，或是新專案／當天大量
測試把每日配額用完——這兩個猜測**都被 Apps Script 的執行紀錄推翻**：
使用者直接查了「執行項目」，`doGet` 實際只花 2.183 秒，遠低於 12 秒
逾時，也沒有任何錯誤或配額訊息。

結論：瓶頸不在商品資料量、不在指令碼執行邏輯，而是在 `/exec` 網址
背後 Google 前端的轉址層（`script.google.com/.../exec` 會 302 轉址到
`script.googleusercontent.com/macros/echo`）與使用者當下的行動網路
路徑，這段延遲**不會**顯示在 Apps Script 自己的執行時間裡，用
`Invoke-WebRequest` 之類的工具量測到的總耗時（涵蓋轉址）也因此常常
比執行紀錄的數字大上許多、且非常不穩定（同一支端點測過 2 秒到
76 秒都有）。這種延遲來源在程式碼層級無法直接消除。

**排查一律先看 Apps Script「執行項目」的實際耗時，再判斷是程式邏輯
慢還是網路／路由延遲**，不要單憑症狀（「初始化失敗」「等很久」）
就直接猜是資料量、配額或程式碼問題。

修正方式（無法根除延遲來源，只能增加容錯）：`getProducts()`
（`js/api.js`）比照 `getCurrentOrders()` 既有的重試慣例，加上一次
自動重試，並把逾時獨立成 `PRODUCTS_TIMEOUT_MS`（20000ms，見
`js/config.js`），不再共用 `REQUEST_TIMEOUT_MS`。這裡可以放心重試，
因為只是我們自己的 JSONP GET 請求，不像 `liff.init()` 有重複呼叫
安全性未知的疑慮（見 8.1.4）。

**規則：修改 `js/`、`index.html` 或 `total-orders.html` 後，
push 之前必須執行 `npm run verify`（第一次要先 `npm install`），
確認 init() 能跑到「叫貨介面已就緒」且沒有 window error 事件，
不能只憑 `test/*.test.js` 全過就視為驗證完成。**

`scripts/verify-liff-init.js` 用 jsdom 載入真正的 `index.html`，依序
執行真正的 `config.js`／`utils.js`／`cart.js`／`ui.js`／`app.js`，
只 stub 掉 `liff` 與 `ProductApi`（無法在 Node 裡連上真的 LINE 與
真的網路）。通過不保證 LINE 內建瀏覽器一定正常（模擬不出真實裝置
快取與 LIFF 環境），但能抓到會讓整個初始化掛掉的明顯錯誤，屬於
push 前的最低限度驗證，不是驗證完成的保證。

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

1. 先閱讀本文件，包含第 8.1 節「已發生過的錯誤與規則」。
2. 確認不會破壞既有 LINE Bot。
3. 確認不會改變固定 LINE 訊息格式。
4. 確認不會改變「商品代號 + 客戶名稱」唯一鍵。
5. 確認同商品同客戶採覆蓋，不是累加。
6. 提供完整檔案，不只提供片段。
7. 說明修改檔案與測試方式。
8. 改動 `js/` 或 `css/` 後，更新兩個 HTML 的 `?v=` 版本字串。
9. 新發生的正式環境故障，修好後要在第 8.1 節補上規則。
10. 改動 `js/`、`index.html` 或 `total-orders.html` 後，push 前先跑
    `npm run verify`（見 8.1.4），確認 init() 正常且無 window error，
    不能只憑 `test/*.test.js` 全過就視為驗證完成。
11. push／redeploy 完的幾分鐘內若協助現場測試，先提醒可能還在等
    快取過期，不要一看到異常就直接當成程式碼壞掉去改。
12. 使用者回報「初始化失敗」「載入太久」等症狀時，先請對方查 Apps
    Script 專案的「執行項目」看實際耗時（見 8.1.5），依實測數字判斷
    瓶頸在程式邏輯、資料量、還是網路／路由延遲，不要單憑症狀用猜的。
