const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function readSource(...parts) {
  return fs.readFileSync(
    path.join(__dirname, "..", ...parts),
    "utf8"
  );
}

// 最小 DOM 替身：只實作 vendor picker 與客戶名稱欄位需要的介面
function createElementStub(tagName) {
  return {
    tagName,
    className: "",
    textContent: "",
    dataset: {},
    disabled: false,
    value: "",
    children: [],
    classList: {
      classes: new Set(),
      toggle(name, force) {
        if (force) {
          this.classes.add(name);
        } else {
          this.classes.delete(name);
        }
      },
      contains(name) {
        return this.classes.has(name);
      }
    },
    listeners: {},
    setAttribute(name, value) {
      if (name.startsWith("data-")) {
        this.dataset[name.slice(5)] = value;
      }
    },
    addEventListener(name, handler) {
      this.listeners[name] = handler;
    },
    appendChild(child) {
      this.children.push(child);
    },
    replaceChildren() {
      this.children = [];
    },
    querySelectorAll() {
      return this.children;
    }
  };
}

const vendorPicker = createElementStub("div");
const customerName = createElementStub("input");
const elementsById = {
  vendorPicker,
  customerName
};

const context = {
  window: {},
  CSS: {escape: (value) => value},
  document: {
    createElement: (tagName) => createElementStub(tagName),
    getElementById: (id) => elementsById[id] || createElementStub("div"),
    querySelector: () => null,
    querySelectorAll: () => []
  }
};
context.global = context;
vm.createContext(context);

vm.runInContext(readSource("js", "config.js"), context);
vm.runInContext(readSource("js", "utils.js"), context);
vm.runInContext(readSource("js", "ui.js"), context);

const config = context.window.APP_CONFIG;
const ui = new context.window.AppUI();

// 設定檔必須提供廠商清單，且與 Apps Script 端一致的十個名稱
assert.strictEqual(
  config.VENDOR_CUSTOMER_NAMES.length,
  10,
  "廠商清單必須有十個名稱"
);
assert.ok(
  config.VENDOR_CUSTOMER_NAMES.includes("I-Charming"),
  "廠商清單必須包含 I-Charming"
);

let selected = "";
ui.renderVendorPicker(
  config.VENDOR_CUSTOMER_NAMES,
  (vendorName) => {
    selected = vendorName;
  }
);

assert.strictEqual(
  vendorPicker.children.length,
  10,
  "每個廠商都要有一個按鈕"
);
assert.strictEqual(
  vendorPicker.children[0].textContent,
  "宣尼",
  "按鈕文字必須是廠商名稱"
);
assert.strictEqual(
  vendorPicker.children[0].dataset.vendor,
  "宣尼",
  "按鈕必須保存廠商名稱供比對"
);

// 點選會回呼廠商名稱
vendorPicker.children[0].listeners.click();
assert.strictEqual(selected, "宣尼", "點選必須回傳對應廠商名稱");

// 手動輸入相同名稱時也要標示為選取，且忽略大小寫與空白
ui.syncVendorPicker("  bio ");
const bioChip = vendorPicker.children.find(
  (chip) => chip.dataset.vendor === "BIO"
);
assert.ok(
  bioChip.classList.contains("is-active"),
  "手動輸入 bio 必須標示 BIO 按鈕"
);

// 一般客戶名稱不得標示任何廠商
ui.syncVendorPicker("小明");
assert.ok(
  vendorPicker.children.every(
    (chip) => !chip.classList.contains("is-active")
  ),
  "一般客戶名稱不得標示廠商按鈕"
);

// 停用控制項時按鈕一併停用
customerName.disabled = true;
ui.renderVendorPicker(config.VENDOR_CUSTOMER_NAMES, () => {});
assert.ok(
  vendorPicker.children.every((chip) => chip.disabled),
  "客戶名稱欄位停用時，廠商按鈕必須一併停用"
);

console.log("VendorPicker.test.js passed");
