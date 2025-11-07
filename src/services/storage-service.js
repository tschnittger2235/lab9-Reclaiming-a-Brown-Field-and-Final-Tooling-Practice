/**
 * Simple localStorage wrapper with namespacing and safe JSON.
 */
export class StorageService {
  /**
   * @param {string} storageKey Namespace prefix.
   */
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  /**
   * @param {string} key
   * @param {unknown} value
   */
  save(key, value) {
    try {
      const fullKey = `${this.storageKey}:${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (err) {
      console.error('StorageService.save failed', err); // why: don’t swallow persistence errors silently
    }
  }

  /**
   * @template T
   * @param {string} key
   * @param {T} [defaultValue]
   * @returns {T|undefined}
   */
  load(key, defaultValue) {
    try {
      const fullKey = `${this.storageKey}:${key}`;
      const raw = localStorage.getItem(fullKey);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.error('StorageService.load failed', err);
      return defaultValue;
    }
  }

  /**
   * @param {string} key
   */
  remove(key) {
    try {
      const fullKey = `${this.storageKey}:${key}`;
      localStorage.removeItem(fullKey);
    } catch (err) {
      console.error('StorageService.remove failed', err);
    }
  }
}
