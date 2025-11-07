import { LitElement, html, css } from 'lit';
import './todo-item.js';

/**
 * @typedef {import('../models/todo-model.js').Todo} Todo
 *
 * Dumb list—renders items and re-emits their events upward.
 */
export class TodoList extends LitElement {
  static properties = {
    todos: { type: Array },
  };

  /** @type {Todo[]} */ todos = [];

  static styles = css`
    ul {
      list-style: none;
      padding: 0;
      margin: 0.25rem 0 0;
    }
  `;

  render() {
    if (!this.todos?.length) {
      return html`<p role="status" aria-live="polite">No tasks yet. Add your first one! 🎉</p>`;
    }
    return html`
      <ul @toggle-todo=${this._bubble} @remove-todo=${this._bubble} @edit-todo=${this._bubble}>
        ${this.todos.map((t) => html`<todo-item .todo=${t}></todo-item>`)}
      </ul>
    `;
  }

  /** Re-dispatch child events on this host so parent can listen on <todo-list>. */
  _bubble(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail, bubbles: true, composed: true }));
  }
}
customElements.define('todo-list', TodoList);
