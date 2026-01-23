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
});
