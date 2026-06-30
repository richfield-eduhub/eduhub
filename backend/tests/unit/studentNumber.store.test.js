const NumberStore = require('../../src/studentNumber/store');

describe('NumberStore', () => {
  it('tracks issued numbers', async () => {
    const store = new NumberStore();
    expect(await store.has('2610000010')).toBe(false);
    await store.add('2610000010');
    expect(await store.has('2610000010')).toBe(true);
    expect(await store.count()).toBe(1);
  });

  it('rejects duplicate numbers', async () => {
    const store = new NumberStore();
    await store.add('2610000011');
    await expect(store.add('2610000011')).rejects.toThrow('Student number already exists');
  });
});
