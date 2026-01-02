import { CommandHandler } from './command-handler';

describe('CommandHandler date param sanitization', () => {
  it('treats non-ISO date strings as missing (structured input)', async () => {
    const handler = new CommandHandler(false);

    const action = jest.fn(async () => ({ type: 'success' as const, message: 'ok' }));

    handler.addCommand({
      id: 'book_appointment',
      command: 'book appointment',
      parameters: [
        { name: 'service', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
      ],
      action,
    });

    const res = await handler.executeCommand({
      commandId: 'book_appointment',
      params: { service: 'toyota limited', date: 'next week thursday' },
    });

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'date')).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });

  it('accepts ISO dates (structured input)', async () => {
    const handler = new CommandHandler(false);

    const action = jest.fn(async () => ({ type: 'success' as const, message: 'ok' }));

    handler.addCommand({
      id: 'book_appointment',
      command: 'book appointment',
      parameters: [
        { name: 'service', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
      ],
      action,
    });

    const res = await handler.executeCommand({
      commandId: 'book_appointment',
      params: { service: 'toyota limited', date: '2026-01-08' },
    });

    expect(res.type).toBe('success');
    expect(action).toHaveBeenCalledTimes(1);
  });
});
