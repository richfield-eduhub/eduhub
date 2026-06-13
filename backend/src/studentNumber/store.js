class NumberStore {
  constructor() {
    this.issued = new Set();
  }

  async has(number) {
    return this.issued.has(String(number));
  }

  async add(number) {
    const normalized = String(number);
    if (this.issued.has(normalized)) {
      throw new Error('Student number already exists');
    }
    this.issued.add(normalized);
  }

  async count() {
    return this.issued.size;
  }
}

module.exports = NumberStore;
