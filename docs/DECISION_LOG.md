# DECISION_LOG.md

## D-001 使用 LIFF

日期：2026-08-01

決策：

使用 LIFF 圖形介面，不使用純 Flex Message 完成所有操作。

原因：

- 商品約 30～100 項
- 需要搜尋
- 需要多商品購物車
- 需要數量加減
- 需要更好的手機操作體驗

## D-002 使用 GitHub Pages

日期：2026-08-01

決策：

LIFF 前端部署到 GitHub Pages。

原因：

Google Apps Script HTML Service 在 iframe 環境中造成 `liff.init()` 無法完成。

## D-003 保留原 LINE Bot

日期：2026-08-01

決策：

LIFF 送出固定格式文字，交給既有 Bot 繼續處理。

原因：

- 降低修改風險
- 保留 Google Sheet
- 保留統計開始／結束
- 保留 Excel 匯出

## D-004 商品排序

日期：2026-08-01

決策：

依商品代號排序，不依商品名稱排序。

## D-005 購物車唯一鍵

日期：2026-08-01

決策：

```text
商品代號 + 客戶名稱
```

## D-006 覆蓋規則

日期：2026-08-01

決策：

相同商品與相同客戶再次加入時，覆蓋數量與付款方式，不累加。

## D-007 付款狀態

日期：2026-08-01

決策：

只支援：

- 已付款
- 未付款
- 自領

## D-008 不使用備註

日期：2026-08-01

決策：

V1 不提供備註欄位，保持介面簡單並維持 Bot 格式相容。

## D-009 數量上限

日期：2026-08-01

決策：

單筆商品數量限制為 1～99，LIFF 與 Bot 後端使用相同規則。

## D-010 客戶名稱禁止數字（已由 D-014 取代）

客戶名稱禁止半形與全形數字，避免手打格式中的數量被誤認為姓名內容；LIFF 與 Bot 後端使用相同規則。

## D-011 總叫貨使用唯讀頁面

在現有 LIFF 增加獨立「總叫貨」頁面與唯讀 API，不改變原叫貨送出流程，也不向前端回傳 LINE User ID。

## D-012 目前叫貨後端權限分流

一般設計師只查看自己的目前叫貨，管理員才可查看全部；由後端驗證 LIFF access token 並使用 `ADMIN_USER_IDS` 判斷權限，不信任前端傳入的姓名或角色。

## D-013 叫貨狀況快速顯示與容錯

使用同分頁五分鐘結果快取、LIFF 初始化重用及一次自動重試；失敗時保留上次成功資料，不降低後端身分驗證要求。

## D-014 客戶名稱開放數字（取代 D-010）

客戶名稱改為僅要求非空白，開放半形與全形數字。固定 LINE 訊息格式為
`商品代號 數量 付款狀態 客戶名稱`（空白分隔、客戶名稱固定為最後一段
到字串結尾），客戶名稱中的數字不會與商品代號後方緊接的數量欄位混淆，
D-010 當初的疑慮不成立；LIFF 與 Bot 後端使用相同規則。

## D-015 叫貨狀況頁面新增單筆刪除（部分取代 D-011 的唯讀原則）

D-011 原本刻意把「叫貨狀況」／「總叫貨」做成唯讀頁面。現在新增單筆
刪除功能，但權限規則沿用既有的查看權限分流（D-012）：一般設計師只
能刪自己的叫貨，管理員可刪任何人的。

後端新增 `action=liffDeleteOrder`（Apps Script `Liff.gs` /
`deleteOrderForLiff_`），一律先用 `verifyLiffAccessToken_` 驗證身分；
一般使用者的可刪範圍**一律以伺服器驗證過的 userId 限定**，不信任
前端傳入的 `designerName`，避免冒用他人姓名刪除他人叫貨。刪除比對
key 為（權限範圍內的擁有者）＋ `productCode` ＋ `customerName`；找到
即用既有的 `runWithOrderLock` 鎖定刪除該列，並呼叫既有的
`refreshItemTotal()`／`refreshLatestOrderList()`，與文字指令
「減少」的刪除路徑共用同一套鎖定與刷新機制。統計結束後（
`ORDER_STATUS` 非 OPEN）禁止刪除，理由與 8.1.6／既有「統計結束禁止
修改」規則一致。

## D-016 廠商快選按鈕改為權限限定（新增「組長」權限層級）

廠商客戶名稱快選按鈕原本任何人都看得到、選得到。現在新增一個介於
管理員與設計師之間的權限「組長」（Apps Script Script Property
`SUPERVISOR_USER_IDS`，比照 `ADMIN_USER_IDS` 的做法管理，選填，未
設定時一律視為沒有此權限），目前**唯一**的權限就是能看到並使用廠商
快選按鈕；除此之外與一般設計師完全相同（看不到全部叫貨、不能刪除
別人的叫貨等）。

後端新增 `action=liffCheckVendorAccess`（`Liff.gs` /
`liffCheckVendorAccessResponse_`），一樣先用 `verifyLiffAccessToken_`
驗證身分，回傳 `canUseVendorShortcuts`（`isAdmin() || isSupervisor()`）；
未登入或驗證失敗一律回傳 `UNAUTHORIZED`，不洩漏權限狀態。

前端不再於 `init()` 一開始就無條件呼叫 `renderVendorPicker()`；改為
`setupVendorPicker()`，在 LIFF 登入完成、拿到 `accessToken` 後才呼叫
`liffCheckVendorAccess`，確認為 `true` 才渲染快選按鈕。這個檢查刻意
**不 await**、不阻擋其餘畫面就緒流程（沿用 8.1.4／8.1.5 對載入速度
的既有堅持），任何失敗（缺少 token、逾時、後端拒絕）都預設為隱藏
（fail closed），不影響叫貨其餘功能。
