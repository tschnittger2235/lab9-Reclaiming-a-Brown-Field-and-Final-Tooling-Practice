import { LitElement, html, css } from 'lit';

/**
 * @fires create-todo - detail: { title: string }
 */
export class TodoForm extends LitElement {
  static styles = css`
    form {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    input[type='text'] {
      flex: 1;
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--border, #ccc);
      border-radius: 0.5rem;
    }
    button {
      padding: 0.6rem 0.9rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      background: var(--accent, #3b82f6);
      color: white;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    label {
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
      <form @submit=${this._onSubmit} novalidate>
        <label for="todo-input">Add a new task</label>
        <input id="todo-input" type="text" name="title" autocomplete="off" placeholder="Add a task…" />
        <button type="submit">Add</button>
      </form>
    `;
  }

  /** @param {SubmitEvent} e */
  _onSubmit(e) {
    e.preventDefault();
    const input = /** @type {HTMLInputElement} */ (this.renderRoot.querySelector('#todo-input'));
    const title = (input?.value ?? '').trim();
    if (!title) return;
    this.dispatchEvent(new CustomEvent('create-todo', { detail: { title }, bubbles: true, composed: true }));
    input.value = '';
    input.focus();
  }
}
customElements.define('todo-form', TodoForm);
