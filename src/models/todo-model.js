/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 */

/**
 * Business logic + persistence for Todos.
 */
export class TodoModel {
  /**
   * @param {import('../services/storage-service.js').StorageService} storage
   */
  constructor(storage) {
    this._storage = storage;
    /** @type {Todo[]} */
    this._todos = this._storage.load('todos', []) ?? [];
  }

  /** @returns {Todo[]} */
  all() {
    return [...this._todos];
  }

  /**
   * @param {string} title
   * @returns {Todo} created todo
   */
  add(title) {
    const t = title.trim();
    if (!t) throw new Error('Title required');
    /** @type {Todo} */
    const todo = { id: crypto.randomUUID(), title: t, done: false };
    this._todos = [todo, ...this._todos];
    this._persist();
    return todo;
  }

  /**
   * @param {string} id
   * @returns {Todo|undefined}
   */
  toggle(id) {
    let updated;
    this._todos = this._todos.map((it) => {
      if (it.id === id) {
        updated = { ...it, done: !it.done };
        return updated;
      }
      return it;
    });
    if (updated) this._persist();
    return updated;
  }

  /**
   * @param {string} id
   * @param {string} title
   * @returns {Todo|undefined}
   */
  edit(id, title) {
    const t = title.trim();
    if (!t) throw new Error('Title required');
    let updated;
    this._todos = this._todos.map((it) => {
      if (it.id === id) {
        updated = { ...it, title: t };
        return updated;
      }
      return it;
    });
    if (updated) this._persist();
    return updated;
  }

  /**
   * @param {string} id
   * @returns {boolean} true if removed
   */
  remove(id) {
    const before = this._todos.length;
    this._todos = this._todos.filter((it) => it.id !== id);
    const changed = this._todos.length !== before;
    if (changed) this._persist();
    return changed;
  }

  /** @returns {number} removed count */
  clearCompleted() {
    const before = this._todos.length;
    this._todos = this._todos.filter((it) => !it.done);
    const removed = before - this._todos.length;
    if (removed) this._persist();
    return removed;
  }

  _persist() {
    this._storage.save('todos', this._todos);
  }
}
