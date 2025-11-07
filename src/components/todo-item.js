import { LitElement, html, css } from 'lit';

/**
 * @typedef {import('../models/todo-model.js').Todo} Todo
 *
 * @fires toggle-todo - detail: { id: string }
 * @fires remove-todo - detail: { id: string }
 * @fires edit-todo   - detail: { id: string, title: string }
 */
export class TodoItem extends LitElement {
  static properties = {
    todo: { type: Object },
    _editing: { state: true },
    _draft: { state: true },
  };

  /** @type {Todo} */ todo;
  /** @type {boolean} */ _editing = false;
  /** @type {string}  */ _draft = '';

  static styles = css`
    li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0.25rem;
      border-bottom: 1px solid var(--row-border, #eee);
    }
    input[type='checkbox'] {
      width: 1.1rem;
      height: 1.1rem;
    }
    .title {
      line-height: 1.6;
    }
    .done {
      text-decoration: line-through;
      opacity: 0.7;
    }
    button {
      background: none;
      border: none;
      color: var(--muted, #555);
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.35rem;
    }
    button:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .edit-row {
      grid-column: 2 / span 2;
      display: flex;
      gap: 0.5rem;
      margin-left: 1.35rem;
    }
    .edit-row input {
      flex: 1;
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--border, #ccc);
      border-radius: 0.4rem;
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
    return html`
      <li>
        <input
          type="checkbox"
          aria-label="Toggle ${this.todo?.title ?? 'task'}"
          .checked=${this.todo?.done ?? false}
          @change=${this._onToggle}
        />
        ${this._editing
          ? html`<span class="sr" aria-live="polite">Editing ${this.todo.title}</span>`
          : html`<div class="title ${this.todo?.done ? 'done' : ''}" @dblclick=${this._startEdit}>
              ${this.todo?.title}
            </div>`}
        <div>
          ${this._editing
            ? html`
                <div class="edit-row">
                  <input
                    id="edit-input"
                    type="text"
                    .value=${this._draft}
                    @keydown=${this._editKey}
                  />
                  <button @click=${this._commitEdit} aria-label="Save edit">Save</button>
                  <button @click=${this._cancelEdit} aria-label="Cancel edit">Cancel</button>
                </div>
              `
            : html`
                <button @click=${this._startEdit} aria-label="Edit">✏️</button>
                <button @click=${this._remove} aria-label="Delete">🗑️</button>
              `}
        </div>
      </li>
    `;
  }

  _onToggle() {
    this.dispatchEvent(
      new CustomEvent('toggle-todo', { detail: { id: this.todo.id }, bubbles: true, composed: true })
    );
  }

  _remove() {
    this.dispatchEvent(
      new CustomEvent('remove-todo', { detail: { id: this.todo.id }, bubbles: true, composed: true })
    );
  }

  _startEdit() {
    this._editing = true;
    this._draft = this.todo.title;
    this.updateComplete.then(() => {
      this.renderRoot.getElementById('edit-input')?.focus();
    });
  }

  _cancelEdit() {
    this._editing = false;
    this._draft = '';
  }

  _commitEdit() {
    const title = (this._draft ?? '').trim();
    if (!title) return this._cancelEdit();
    this.dispatchEvent(
      new CustomEvent('edit-todo', {
        detail: { id: this.todo.id, title },
        bubbles: true,
        composed: true,
      })
    );
    this._editing = false;
  }

  /** @param {KeyboardEvent} e */
  _editKey(e) {
    if (e.key === 'Enter') this._commitEdit();
    if (e.key === 'Escape') this._cancelEdit();
    if (e.target instanceof HTMLInputElement) this._draft = e.target.value;
  }
}
customElements.define('todo-item', TodoItem);
