# TEST_CASE.md

## TC-001 商品排序

Given：

```text
A10, A02, B01, A01
```

Expected：

```text
A01, A02, A10, B01
```

## TC-002 搜尋商品代號

搜尋：

```text
A02
```

Expected：

只顯示包含 A02 的商品。

## TC-003 搜尋商品名稱

搜尋：

```text
護髮
```

Expected：

顯示名稱包含「護髮」的商品。

## TC-004 加入單筆商品

輸入：

```text
A02
10
已付款
小明
```

Expected：

購物車：

```text
A02 10 已付款 小明
```

## TC-005 相同商品同客戶覆蓋

第一次：

```text
A02 10 已付款 小明
```

第二次：

```text
A02 5 自領 小明
```

Expected：

```text
A02 5 自領 小明
```

購物車只有一筆。

## TC-006 相同商品不同客戶

輸入：

```text
A02 10 已付款 小明
A02 5 自領 小華
```

Expected：

購物車保留兩筆。

## TC-007 多商品送出

購物車：

```text
A02 10 已付款 小明
A08 2 自領 小華
```

Expected LINE 文字：

```text
A02 10 已付款 小明
A08 2 自領 小華
```

## TC-008 數量為 0

輸入：

```text
0
```

Expected：

拒絕加入，顯示數量錯誤。

## TC-009 數量為負數

輸入：

```text
-2
```

Expected：

拒絕加入。

## TC-009A 數量超過上限

輸入：

```text
100
```

Expected：

拒絕加入，顯示數量不可超過 99。

## TC-010 客戶名稱空白

輸入：

```text
"   "
```

Expected：

拒絕加入，顯示客戶名稱必填。

## TC-010A 客戶名稱包含數字

輸入 `網美 10 大學生` 或 `網美１０大學生`。

預期：正常加入購物車，客戶名稱原樣保留（見決策 D-014）。

## TC-011 付款狀態

逐一測試：

- 已付款
- 未付款
- 自領

Expected：

固定文字完全一致。

## TC-012 商品 API 無分類

API 商品沒有 category。

Expected：

前端仍正常顯示，分類預設為「其他」。

## TC-013 防重複送出

快速連點送出按鈕。

Expected：

只送出一次。

## TC-014 非 LINE 內開啟

從一般瀏覽器開啟。

Expected：

頁面可顯示，但送出時提示需從 LINE 開啟。


## TC-015 購物車 localStorage 還原

Given：

購物車已有資料並重新整理頁面。

Expected：

購物車資料仍存在。

## TC-016 商品 API 重複代號

Given：

API 回傳兩筆相同商品代號。

Expected：

前端只保留最後一筆。

## TC-017 付款方式即時修改

Given：

購物車中 A02 為已付款。

Action：

改成自領。

Expected：

預覽立即變成：

```text
A02 10 自領 小明
```

## TC-018 購物車數量即時修改

Given：

購物車中 A02 數量為 10。

Action：

按減號一次。

Expected：

數量變成 9，預覽同步更新。

## TC-019 一般瀏覽器禁止送出

Given：

`liff.isInClient()` 為 false。

Expected：

可瀏覽與建立購物車，但送出時提示需從 LINE 群組開啟。

## TC-020 LIFF 送出成功

Given：

購物車有多筆資料，且在 LINE 內開啟。

Expected：

`liff.sendMessages()` 只呼叫一次，內容為一則多行文字訊息。


## TC-021 健康檢查 API

Request：

```text
?action=health
```

Expected：

- `success = true`
- version 為 `1.0.0-alpha.3`
- 包含 timestamp

## TC-022 正式商品 API

Request：

```text
?action=liffGetProducts
```

Expected：

- `success = true`
- `products` 為陣列
- 每筆包含 code、name、unit、category

## TC-023 舊版 action 相容

Request：

```text
?action=liffProducts
```

Expected：

與 `liffGetProducts` 回傳相同商品格式。

## TC-024 MenuService 優先

Given：

專案存在 `MenuService.getDisplayProducts()`。

Expected：

API 不直接讀取工作表，使用既有 MenuService。

## TC-025 無 MenuService 備援

Given：

專案沒有 MenuService，但商品工作表存在。

Expected：

API 直接讀取商品工作表。

## TC-026 無分類欄位

Given：

商品工作表沒有分類欄。

Expected：

每筆 category 為「其他」。

## TC-027 停用商品

Given：

商品啟用欄為 false、否、停用或 0。

Expected：

商品不出現在 API。

## TC-028 重複商品代號

Given：

兩筆商品代號皆為 A02。

Expected：

API 最後只回傳一筆 A02，後一筆覆蓋前一筆。

## TC-029 商品代號自然排序

Given：

```text
A10, A2, A01, B1
```

Expected：

```text
A01, A2, A10, B1
```

## TC-030 doGet 唯一性

Given：

Apps Script 專案已存在其他 `doGet(e)`。

Expected：

合併路由後只保留一個全域 `doGet(e)`。

## TC-031 叫貨狀況頁面

一般設計師開啟後只顯示自己的叫貨；管理員開啟後顯示全部設計師資料。頁面顯示筆數、商品總數與明細，按「重新整理」會重新驗證並呼叫 API。

## TC-032 總叫貨隱私欄位

`liffGetCurrentOrders` 回傳設計師、商品、數量、付款與客戶名稱，但不得包含 LINE User ID。

## TC-033 未驗證使用者

缺少或無效 LIFF access token 時，API 回傳 `UNAUTHORIZED`，且不得讀取或回傳 ORDERS。

## TC-034 叫貨狀況快速顯示與失敗備援

同分頁存在五分鐘內快取時先立即顯示，再背景更新；第一次 API 失敗時自動重試一次。若仍失敗，保留上次成功資料並顯示提示。
