// @jest-environment jsdom
/**
 * Basic tests for OverlayManager command registry and runCommand.
 */
import { OverlayManager } from '../overlay-manager';

describe('OverlayManager runCommand', () => {
  let overlay: OverlayManager;

  beforeEach(() => {
    // Create a minimal DOM container so OverlayManager can initialize
    document.body.innerHTML = '';
    overlay = new OverlayManager({ floatingButton: { visible: false } });
  });

  afterEach(() => {
    overlay.destroy();
    document.body.innerHTML = '';
  });

  test('registers and runs a command handler and returns result', async () => {
    const handler = jest.fn(async (params) => {
      return `ok:${params?.id ?? 'none'}`;
    });

    overlay.registerCommandHandler('escalate', handler);

    const res = await overlay.runCommand({ commandId: 'escalate', params: { id: 42 }, openOverlay: false, showInvocation: false });

    expect(handler).toHaveBeenCalledWith({ id: 42 });
    expect(res).toBe('ok:42');
  });

  test('handles missing handler gracefully', async () => {
    const res = await overlay.runCommand({ commandId: 'notfound', openOverlay: false, showInvocation: false });
    expect(res).toBeUndefined();
  });

  test('shows messages for string and object results', async () => {
    const handler1 = jest.fn(() => 'a string');
    const handler2 = jest.fn(() => ({ foo: 'bar' }));

    overlay.registerCommandHandler('s1', handler1);
    overlay.registerCommandHandler('s2', handler2);

    await overlay.runCommand({ commandId: 's1', openOverlay: false, showInvocation: false });
    await overlay.runCommand({ commandId: 's2', openOverlay: false, showInvocation: false });

    // messagesContainer should contain rendered messages
    const msgs = document.querySelectorAll('#foisit-overlay-container .foisit-messages .foisit-bubble.system');
    // at least two system messages (results)
    expect(msgs.length).toBeGreaterThanOrEqual(2);
  });

  test('addForm supports multi-select values', () => {
    const received: any = [];
    overlay.registerCallbacks((input) => received.push(input), () => { /* empty */ });

    overlay.addForm(
      'Choose drinks',
      [
        {
          name: 'drinks',
          type: 'select' as const,
          options: [
            { label: 'Coffee', value: 'coffee' },
            { label: 'Tea', value: 'tea' },
          ],
          multiple: true,
          required: true,
        },
      ],
      (data) => {
        received.push(data);
      }
    );

    // simulate user checking both boxes
    const checkboxes = Array.from(document.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];
    checkboxes.forEach((cb) => (cb.checked = true));

    const form = document.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // onSubmit callback should have been invoked with object containing array
    expect(received.length).toBeGreaterThanOrEqual(1);
    const last = received[received.length - 1];
    expect(last).toEqual({ drinks: ['coffee', 'tea'] });
  });

  test('addOptions multi selection works with confirmation', () => {
    const received: any[] = [];
    overlay.registerCallbacks((input) => received.push(input), () => { /* empty */ });

    overlay.addOptions(
      [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
      { allowMultiple: true, confirmLabel: 'Done' }
    );

    // click both pills
    const buttons = Array.from(document.querySelectorAll('.foisit-option-chip')) as HTMLButtonElement[];
    // last one is confirm
    buttons.slice(0, 2).forEach((btn) => btn.click());
    const confirm = buttons[2];
    confirm.click();

    expect(received).toEqual([['a', 'b']]);
  });
});
