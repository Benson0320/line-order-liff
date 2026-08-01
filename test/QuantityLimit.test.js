const fs = require("fs");
const vm = require("vm");

const context = {
    window: {
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        }
    },
    console
};

context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/config.js", "utf8"), context);
vm.runInContext(fs.readFileSync("js/utils.js", "utf8"), context);
vm.runInContext(fs.readFileSync("js/cart.js", "utf8"), context);

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

assert(
    context.window.APP_CONFIG.MAX_QUANTITY === 99,
    "LIFF 數量上限必須為 99"
);
assert(
    context.window.AppUtils.validateQuantity(99, 99).valid,
    "數量 99 必須可加入"
);
assert(
    !context.window.AppUtils.validateQuantity(100, 99).valid,
    "數量 100 必須拒絕"
);

console.log("QuantityLimit.test.js PASS");
