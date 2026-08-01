\# LINE Hair Salon Ordering System



美髮沙龍設計師使用的 LINE 圖形化叫貨系統。



本專案透過 LIFF 提供商品搜尋、多商品購物車、付款狀態與客戶名稱輸入，最後將資料以既有 LINE Bot 可解析的格式送回 LINE 群組。



\## 專案定位



這是：



\- 美髮設計師叫貨系統

\- 進貨與商品統計系統

\- Google Sheet 與 LINE Bot 的圖形化操作入口



這不是：



\- 餐飲點餐系統

\- 電商付款系統

\- 線上商城



\## V1 功能



\- 商品依代號排序

\- 商品代號或名稱搜尋

\- 商品分類預留

\- 多商品購物車

\- 數量加減與手動輸入

\- 客戶名稱

\- 付款狀態：

&#x20; - 已付款

&#x20; - 未付款

&#x20; - 自領

\- 同商品、同客戶時覆蓋數量與付款

\- 同商品、不同客戶時保留不同資料

\- 一次送出多筆到 LINE 群組

\- 保持既有 LINE Bot 與 Google Sheet 相容



\## 固定訊息格式



```text

A02 10 已付款 小明

```



多筆資料：



```text

A02 10 已付款 小明

A08 2 自領 小華

```



\## 技術架構



```text

LINE 群組

&#x20; ↓

LIFF

&#x20; ↓

GitHub Pages

&#x20; ↓

Google Apps Script API

&#x20; ↓

Google Sheet

&#x20; ↓

既有 LINE Bot

```



\## 目錄



```text

line-hair-ordering-system/

├── AI\_CONTEXT.md

├── README.md

├── docs/

├── src/

│   ├── index.html

│   ├── css/

│   └── js/

└── AppsScript/

```



\## 文件索引



\- \[AI 開發上下文](AI\_CONTEXT.md)

\- \[產品規格](docs/PRODUCT\_SPEC.md)

\- \[商業規則](docs/BUSINESS\_RULE.md)

\- \[系統架構](docs/ARCHITECTURE.md)

\- \[API 規格](docs/API.md)

\- \[資料結構](docs/DATABASE.md)

\- \[指令規格](docs/COMMAND.md)

\- \[UI 規格](docs/UI\_SPEC.md)

\- \[安裝說明](docs/INSTALL.md)

\- \[測試案例](docs/TEST\_CASE.md)

\- \[版本資訊](docs/VERSION.md)

\- \[變更紀錄](docs/CHANGELOG.md)



\## 目前階段



目前為：



```text

v1.0.0-alpha.3

Milestone 3

```



已完成：



\- 專案文件

\- 前端 HTML 骨架

\- CSS 基礎樣式



尚未完成：



\- 正式 Apps Script 專案合併

\- Web App 新版本部署

\- GitHub Pages 與 LINE 群組整合測試



