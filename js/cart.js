(function exposeCart(global) {
  "use strict";

  const config = global.APP_CONFIG;
  const utils = global.AppUtils;

  class CartStore {
    constructor(storageKey, options = {}) {
      this.storageKey = storageKey;
      this.items = [];
      this.listeners = new Set();
      this.onPersistError = options.onPersistError || (() => {});
      this.restore();
    }

    restore() {
      const storedItems = utils.storageGet(
        this.storageKey,
        []
      );

      if (!Array.isArray(storedItems)) {
        this.items = [];
        return;
      }

      this.items = storedItems
        .map((item) => this.normalizeItem(item))
        .filter(Boolean);
    }

    normalizeItem(item) {
      const productCode = utils
        .normalizeText(item?.productCode)
        .toUpperCase();

      const productName = utils.normalizeText(
        item?.productName
      );

      const customerName = utils.normalizeText(
        item?.customerName
      );

      const quantity = Number(item?.quantity);
      const paymentStatus = utils.normalizeText(
        item?.paymentStatus
      );

      if (
        !productCode ||
        !productName ||
        !utils.validateCustomerName(customerName).valid ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > config.MAX_QUANTITY ||
        !config.PAYMENT_STATUSES.includes(paymentStatus)
      ) {
        return null;
      }

      return {
        id:
          utils.normalizeText(item?.id) ||
          utils.generateId("cart"),
        key: utils.createCartKey(
          productCode,
          customerName
        ),
        productCode,
        productName,
        unit: utils.normalizeText(item?.unit),
        quantity,
        paymentStatus,
        customerName
      };
    }

    getItems() {
      return this.items.map((item) => ({ ...item }));
    }

    get size() {
      return this.items.length;
    }

    findByKey(key) {
      return this.items.find((item) => item.key === key) || null;
    }

    upsert(orderData) {
      const normalized = this.normalizeItem({
        ...orderData,
        id: orderData?.id || utils.generateId("cart")
      });

      if (!normalized) {
        throw new Error("購物車資料格式不正確。");
      }

      const existingIndex = this.items.findIndex(
        (item) => item.key === normalized.key
      );

      let mode = "created";

      if (existingIndex >= 0) {
        normalized.id = this.items[existingIndex].id;
        this.items.splice(existingIndex, 1, normalized);
        mode = "updated";
      } else {
        this.items.push(normalized);
      }

      this.sortItems();
      this.persist();
      this.emit();

      return {
        mode,
        item: { ...normalized }
      };
    }

    updateById(id, changes) {
      const index = this.items.findIndex(
        (item) => item.id === id
      );

      if (index < 0) {
        return false;
      }

      const current = this.items[index];
      const updated = this.normalizeItem({
        ...current,
        ...changes,
        id: current.id
      });

      if (!updated) {
        throw new Error("更新後的購物車資料不正確。");
      }

      const duplicateIndex = this.items.findIndex(
        (item, itemIndex) =>
          itemIndex !== index &&
          item.key === updated.key
      );

      if (duplicateIndex >= 0) {
        this.items.splice(duplicateIndex, 1);
      }

      const currentIndex = this.items.findIndex(
        (item) => item.id === id
      );

      this.items.splice(currentIndex, 1, updated);
      this.sortItems();
      this.persist();
      this.emit();

      return true;
    }

    removeById(id) {
      const originalLength = this.items.length;

      this.items = this.items.filter(
        (item) => item.id !== id
      );

      if (this.items.length === originalLength) {
        return false;
      }

      this.persist();
      this.emit();
      return true;
    }

    clear() {
      this.items = [];
      this.persist();
      this.emit();
    }

    sortItems() {
      this.items.sort((left, right) => {
        const codeComparison = utils.naturalCompare(
          left.productCode,
          right.productCode
        );

        if (codeComparison !== 0) {
          return codeComparison;
        }

        return utils.naturalCompare(
          left.customerName,
          right.customerName
        );
      });
    }

    persist() {
      const saved =
        this.items.length === 0
          ? utils.storageRemove(this.storageKey)
          : utils.storageSet(this.storageKey, this.items);

      if (!saved) {
        this.onPersistError();
      }
    }

    subscribe(listener) {
      this.listeners.add(listener);

      return () => {
        this.listeners.delete(listener);
      };
    }

    emit() {
      const snapshot = this.getItems();

      this.listeners.forEach((listener) => {
        try {
          listener(snapshot);
        } catch (error) {
          console.error("購物車 listener 執行失敗：", error);
        }
      });
    }
  }

  global.CartStore = CartStore;
})(window);
