import { LitElement, html, css } from 'lit';
import { StorageService } from '../services/storage-service.js';
import { TodoModel } from '../models/todo-model.js';
import './todo-form.js';
import './todo-list.js';

/**
 * Root app: owns state, wires model <-> UI.
 */
export class TodoApp extends LitElement {
  static properties = {
    todos: { state: true },
    filter: { state: true }, // 'all' | 'active' | 'completed'
  };

  /** @type {import('../models/todo-model.js').Todo[]} */ todos = [];
  /** @type {'all'|'active'|'completed'} */ filter = 'all';

  constructor() {
    super();
    this._model = new TodoModel(new StorageService('taskapp'));
    this.todos = this._model.all();
  }

  static styles = css`
    :host {
      display: block;
      max-width: 720px;
      margin: 2rem auto;
      padding: 1rem;
      border-radius: 1rem;
      border: 1px solid var(--card-border, #e5e7eb);
      background: var(--card-bg, #fff);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.4rem;
      margin: 0;
    }
    .filters {
      display: inline-flex;
      gap: 0.25rem;
      border: 1px solid var(--border, #ddd);
      border-radius: 0.5rem;
      padding: 0.15rem;
    }
    .filters button {
      background: none;
      border: none;
      padding: 0.4rem 0.6rem;
      border-radius: 0.4rem;
      cursor: pointer;
    }
    .filters button[aria-pressed='true'] {
      background: var(--accent-weak, rgba(59, 130, 246, 0.12));
      color: var(--accent, #2563eb);
    }
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .muted {
      color: #666;
      font-size: 0.95rem;
    }
    .danger {
      color: #b91c1c;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .actions button {
      background: none;
      border: 1px solid var(--border, #ddd);
      padding: 0.4rem 0.6rem;
      border-radius: 0.4rem;
      cursor: pointer;
    }
    .actions button:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `;

  render() {
    const shown = this._filtered();
    const left = this.todos.filter((t) => !t.done).length;

    return html`
      <section aria-labelledby="heading">
        <header>
          <h1 id="heading">Task Manager</h1>
          <nav class="filters" aria-label="Filters">
            ${this._filterBtn('all', 'All')}
            ${this._filterBtn('active', 'Active')}
            ${this._filterBtn('completed', 'Completed')}
          </nav>
        </header>

        <todo-form @create-todo=${this._onCreate}></todo-form>

        <todo-list
          .todos=${shown}
          @toggle-todo=${this._onToggle}
          @remove-todo=${this._onRemove}
          @edit-todo=${this._onEdit}
        ></todo-list>

        <footer>
          <div class="muted" role="status" aria-live="polite">
            ${left} ${left === 1 ? 'item' : 'items'} left
          </div>
          <div class="actions">
            <button class="danger" @click=${this._clearCompleted}>Clear completed</button>
          </div>
        </footer>

        <p class="sr" aria-live="polite" id="live-region"></p>
      </section>
    `;
  }

  /** @param {'all'|'active'|'completed'} key @param {string} label */
  _filterBtn(key, label) {
    const pressed = this.filter === key;
    return html`<button
      aria-pressed=${pressed ? 'true' : 'false'}
      @click=${() => (this.filter = key)}
    >
      ${label}
    </button>`;
  }

  _filtered() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter((t) => !t.done);
      case 'completed':
        return this.todos.filter((t) => t.done);
      default:
        return this.todos;
    }
  }

  _announce(msg) {
    const node = /** @type {HTMLElement} */ (this.renderRoot.getElementById('live-region'));
    if (node) node.textContent = msg;
  }

  /** @param {CustomEvent<{title: string}>} e */
  _onCreate(e) {
    try {
      this._model.add(e.detail.title);
      this.todos = this._model.all();
      this._announce('Task added');
    } catch (err) {
      console.error(err);
    }
  }

  /** @param {CustomEvent<{id: string}>} e */
  _onToggle(e) {
    this._model.toggle(e.detail.id);
    this.todos = this._model.all();
  }

  /** @param {CustomEvent<{id: string}>} e */
  _onRemove(e) {
    this._model.remove(e.detail.id);
    this.todos = this._model.all();
    this._announce('Task removed');
  }

  /** @param {CustomEvent<{id: string, title: string}>} e */
  _onEdit(e) {
    try {
      this._model.edit(e.detail.id, e.detail.title);
      this.todos = this._model.all();
      this._announce('Task updated');
    } catch (err) {
      console.error(err);
    }
  }

  _clearCompleted() {
    const removed = this._model.clearCompleted();
    if (removed) {
      this.todos = this._model.all();
      this._announce(`${removed} completed ${removed === 1 ? 'task' : 'tasks'} cleared`);
    }
  }
}

customElements.define('todo-app', TodoApp);
