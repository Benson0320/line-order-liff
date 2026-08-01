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

Apps Script 後端應固定沿用同一個 Web App deployment ID。更新既有 deployment 時 `/exec` URL 不會改變，因此 `js/config.js` 的 `WEB_APP_URL` 只需設定一次，不必在每次版本發布時重貼網址。

只有建立全新的 Web App deployment 時，才需要同步修改 `WEB_APP_URL`；一般更新請勿新增 deployment。

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
