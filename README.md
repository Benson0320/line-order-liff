# LIFF 商品 API 跨網域修正版

## 問題

GitHub Pages 與 Apps Script 位於不同網域。

瀏覽器直接使用 `fetch()` 讀取 Apps Script ContentService 時，
在部分 LINE WebView 會因跨網域限制而失敗。

## 修正方式

改用 JSONP：

- Apps Script 支援 `callback` 參數。
- GitHub Pages 的 `api.js` 以動態 `<script>` 讀取商品。
- 不需要修改原 LINE Bot、Google Sheet 或 doPost(e)。

## 要覆蓋的檔案

1. Apps Script：
   `AppsScript/Liff.gs`

2. GitHub：
   `js/api.js`

## Apps Script 操作

覆蓋 Liff.gs 後：

部署 → 管理部署作業 → 編輯 → 新版本 → 部署

測試：

WEB_APP_URL?action=liffGetProducts&callback=testCallback

頁面會顯示：

testCallback({...});

## GitHub 操作

用新 `js/api.js` 覆蓋 GitHub 根目錄的：

js/api.js

Commit 後等待 GitHub Pages 更新，再重新開啟 LIFF。
