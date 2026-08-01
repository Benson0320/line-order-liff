const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "..", "js", "utils.js"), "utf8"),
  context
);

const validate = context.window.AppUtils.validateCustomerName;

assert.strictEqual(validate("網美 10 大學生").valid, false);
assert.strictEqual(validate("網美１０大學生").valid, false);
assert.strictEqual(validate("網美大學生").valid, true);
assert.strictEqual(validate("網美大學生").value, "網美大學生");

console.log("CustomerNameValidation.test.js passed");
