import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoModel } from '../src/models/todo-model.js';

/** In-memory storage to isolate from real localStorage. */
class MemoryStorageService {
  constructor(prefix = 'test') {
    this.prefix = prefix;
    this.store = new Map();
  }
  _k(k) {
    return `${this.prefix}:${k}`;
  }
  save(k, v) {
    this.store.set(this._k(k), JSON.stringify(v));
  }
  load(k, def) {
    const raw = this.store.get(this._k(k));
    return raw == null ? def : JSON.parse(raw);
  }
  remove(k) {
    this.store.delete(this._k(k));
  }
}

describe('TodoModel', () => {
  /** @type {MemoryStorageService} */
  let storage;
  /** @type {TodoModel} */
  let model;

  // why: ensure crypto.randomUUID exists in test env
  beforeEach(() => {
    if (!globalThis.crypto) {
      globalThis.crypto = /** @type any */ ({});
    }
    if (!globalThis.crypto.randomUUID) {
      let i = 0;
      globalThis.crypto.randomUUID = () => `id-${Date.now()}-${i++}`;
    }
    storage = new MemoryStorageService('taskapp');
    model = new TodoModel(storage);
  });

  it('starts empty', () => {
    expect(model.all()).toEqual([]);
  });

  it('adds a todo and persists it', () => {
    const todo = model.add('Write tests');
    expect(todo.title).toBe('Write tests');
    expect(todo.done).toBe(false);

    const all = model.all();
    expect(all.length).toBe(1);
    expect(all[0]).toMatchObject({ id: todo.id, title: 'Write tests', done: false });

    // persisted
    const model2 = new TodoModel(storage);
    expect(model2.all()).toEqual(all);
  });

  it('trims title and rejects empty titles on add', () => {
    const t = model.add('  hello  ');
    expect(t.title).toBe('hello');

    expect(() => model.add('')).toThrow(/Title required/);
    expect(() => model.add('   ')).toThrow(/Title required/);
  });

  it('toggles a todo by id', () => {
    const a = model.add('A');
    const b = model.add('B');

    const toggled = model.toggle(a.id);
    expect(toggled?.done).toBe(true);

    const after = model.all();
    const aAfter = after.find((x) => x.id === a.id);
    const bAfter = after.find((x) => x.id === b.id);
    expect(aAfter?.done).toBe(true);
    expect(bAfter?.done).toBe(false);
  });

  it('edit updates title and trims; rejects empty', () => {
    const a = model.add('Old');
    const updated = model.edit(a.id, '  New  ');
    expect(updated?.title).toBe('New');
    expect(model.all()[0].title).toBe('New');

    expect(() => model.edit(a.id, '  ')).toThrow(/Title required/);
  });

  it('remove deletes item by id and persists', () => {
    const a = model.add('X');
    const b = model.add('Y');
    const ok = model.remove(a.id);
    expect(ok).toBe(true);
    expect(model.all().map((t) => t.id)).toEqual([b.id]);

    // removing unknown id is a no-op
    expect(model.remove('nope')).toBe(false);
  });

  it('clearCompleted removes only completed items and returns count', () => {
    const a = model.add('A');
    const b = model.add('B');
    const c = model.add('C');
    model.toggle(a.id); // done
    model.toggle(c.id); // done

    const removed = model.clearCompleted();
    expect(removed).toBe(2);
    const titles = model.all().map((t) => t.title);
    expect(titles).toEqual(['B']);
  });

  it('all() returns a defensive copy', () => {
    model.add('safe');
    const list = model.all();
    list.push({ id: 'hack', title: 'hack', done: true });
    expect(model.all().length).toBe(1);
  });

  it('persists across instances', () => {
    model.add('persist me');
    const again = new TodoModel(storage);
    expect(again.all().map((t) => t.title)).toContain('persist me');
  });

  it('is resilient to bad stored JSON', () => {
    // Corrupt underlying storage; model should fall back to []
    storage.save('todos', 'not-json'); // bypass type by directly setting raw (simulate corruption)
    // simulate corruption: overwrite internal map directly
    storage.store.set('taskapp:todos', 'not-json');
    const fresh = new TodoModel(storage);
    // load failure will default in constructor to []
    expect(Array.isArray(fresh.all())).toBe(true);
  });
});
