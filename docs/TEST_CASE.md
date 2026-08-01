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

## TC-010 客戶名稱空白

輸入：

```text
"   "
```

Expected：

拒絕加入，顯示客戶名稱必填。

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
