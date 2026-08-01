# LINE Hair Salon Ordering System

美髮沙龍設計師使用的 LINE 圖形化叫貨系統。

本專案透過 LIFF 提供商品搜尋、多商品購物車、付款狀態與客戶名稱輸入，最後將資料以既有 LINE Bot 可解析的格式送回 LINE 群組。

## 專案定位

這是：

- 美髮設計師叫貨系統
- 進貨與商品統計系統
- Google Sheet 與 LINE Bot 的圖形化操作入口

這不是：

- 餐飲點餐系統
- 電商付款系統
- 線上商城

## V1 功能

- 商品依代號排序
- 商品代號或名稱搜尋
- 商品分類預留
- 多商品購物車
- 數量加減與手動輸入
- 客戶名稱
- 付款狀態：
  - 已付款
  - 未付款
  - 自領
- 同商品、同客戶時覆蓋數量與付款
- 同商品、不同客戶時保留不同資料
- 一次送出多筆到 LINE 群組
- 保持既有 LINE Bot 與 Google Sheet 相容

## 固定訊息格式

```text
A02 10 已付款 小明
```

多筆資料：

```text
A02 10 已付款 小明
A08 2 自領 小華
```

## 技術架構

```text
LINE 群組
  ↓
LIFF
  ↓
GitHub Pages
  ↓
Google Apps Script API
  ↓
Google Sheet
  ↓
既有 LINE Bot
```

## 目錄

```text
line-hair-ordering-system/
├── AI_CONTEXT.md
├── README.md
├── docs/
├── src/
│   ├── index.html
│   ├── css/
│   └── js/
└── AppsScript/
```

## 文件索引

- [AI 開發上下文](AI_CONTEXT.md)
- [產品規格](docs/PRODUCT_SPEC.md)
- [商業規則](docs/BUSINESS_RULE.md)
- [系統架構](docs/ARCHITECTURE.md)
- [API 規格](docs/API.md)
- [資料結構](docs/DATABASE.md)
- [指令規格](docs/COMMAND.md)
- [UI 規格](docs/UI_SPEC.md)
- [安裝說明](docs/INSTALL.md)
- [測試案例](docs/TEST_CASE.md)
- [版本資訊](docs/VERSION.md)
- [變更紀錄](docs/CHANGELOG.md)

## 目前階段

目前為：

```text
v1.0.0-alpha.2
Milestone 2
```

已完成：

- 專案文件
- 前端 HTML 骨架
- CSS 基礎樣式

尚未完成：

- Apps Script 商品 API
- Google Sheet 欄位解析
- 整合測試
