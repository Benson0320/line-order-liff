# INSTALL.md

## 1. GitHub Pages

將 `src/` 內的前端檔案部署到 GitHub Pages 根目錄。

GitHub Repository：

```text
line-hair-ordering-system
```

Pages 設定：

```text
Settings
→ Pages
→ Deploy from a branch
→ main
→ /(root) 或 /docs
```

若使用本專案 `src/` 目錄，正式上線前可將 `src/` 內容複製至 Repository 根目錄。

## 2. 前端設定

Milestone 2 將建立：

```text
src/js/config.js
```

需填入：

```javascript
LIFF_ID
WEB_APP_URL
```

可公開：

- LIFF ID
- Apps Script Web App URL

不可公開：

- Channel Secret
- Channel Access Token

## 3. Apps Script

將 AppsScript 相關 `.gs` 檔放入既有 Apps Script 專案。

部署：

```text
部署
→ 管理部署作業
→ 新增或編輯部署
→ 網頁應用程式
```

設定：

```text
執行身分：我
誰可以存取：任何人
```

## 4. LINE Developers

到 LINE Login Channel：

```text
LIFF
→ Endpoint URL
```

填入 GitHub Pages 網址，例如：

```text
https://Benson0320.github.io/line-hair-ordering-system/
```

LIFF Scope 建議：

- profile
- openid
- chat_message.write

## 5. 測試

先測試 GitHub Pages：

- 頁面可開啟
- CSS 正常
- 無 404

再從 LINE 群組開啟 LIFF URL。

## 6. 重新部署

前端：

```text
git add .
git commit -m "feat: update LIFF UI"
git push
```

Apps Script：

```text
部署
→ 管理部署作業
→ 編輯
→ 新版本
→ 部署
```
