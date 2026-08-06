# CHANGELOG.md

所有重要變更記錄於此。

## [Unreleased]

- LIFF 初始化逾時改用獨立的 `LIFF_INIT_TIMEOUT_MS`（20 秒），不再與其他 API 共用 12 秒逾時，減少網路較慢時的初始化失敗
- 新增 `scripts/verify-liff-init.js`（`npm run verify`），push 前可實際跑一次 init() 流程而非只靠單元測試
- 客戶名稱開放輸入半形與全形數字，僅維持必填驗證（取代下方「禁止數字」規則，見決策 D-014）
- 目前叫貨快取改為依 LIFF access token 雜湊隔離，完成 LINE 驗證前不顯示舊帳號資料
- 加速叫貨狀況讀取，加入同分頁短期快取、LIFF 初始化重用、一次自動重試與失敗保留舊資料
- 叫貨狀況加入 LINE 身分驗證：一般設計師只看自己，管理員才可看全部
- 新增「總叫貨」頁面，可查看目前全部設計師叫貨摘要與明細並手動重新整理
- 客戶名稱禁止半形與全形數字，LIFF 輸入與購物車還原皆套用相同驗證
- 單筆商品數量上限由 9999 調整為 99
- 數量輸入、購物車還原與加入購物車皆拒絕超過 99 的資料

## [1.0.0-alpha.3] - 2026-08-01

### Added

- 新增 `AppsScript/Config.gs`。
- 新增 `AppsScript/Utils.gs`。
- 新增 `AppsScript/Sheet.gs`。
- 新增 `AppsScript/Api.gs`。
- 新增 `AppsScript/Liff.gs`。
- 新增 `AppsScript/README-MERGE.md`。
- 新增 `action=liffGetProducts` 商品 JSON API。
- 保留舊版 `action=liffProducts` 相容。
- 新增 `action=health` 健康檢查 API。
- 優先沿用既有 `MenuService.getDisplayProducts()`。
- 無 MenuService 時，自動從 Google Sheet 讀取商品。
- 支援多種商品欄位名稱。
- 支援啟用、分類、單位與排序欄位。
- 缺少分類時預設為「其他」。
- 商品依商品代號自然排序。
- 重複商品代號採後值覆蓋。
- 新增 doGet 合併指引，避免破壞既有 Bot。

### Compatibility

- 不修改 `doPost(e)`。
- 不修改 LINE Webhook。
- 不修改統計開始、統計結束、重新開放。
- 不修改 Excel 匯出。
- 不修改既有訂單解析格式。

### Pending

- 固定沿用既有 Apps Script Web App deployment ID，避免每次發布重貼 `WEB_APP_URL`
- Apps Script 實際專案合併。
- Web App 新版本部署。
- GitHub Pages 實機讀取商品。
- LINE 群組整合測試。

## [1.0.0-alpha.2] - 2026-08-01

### Added

- 完成 LIFF 前端。
- 完成商品搜尋與多商品購物車。
- 完成覆蓋邏輯與 LINE 多筆送出。

## [1.0.0-alpha.1] - 2026-08-01

### Added

- 建立專案骨架與完整規格文件。
