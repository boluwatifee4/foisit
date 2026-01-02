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

describe('CommandHandler required param collection and validation', () => {
  it('asks for required string when empty', async () => {
    const handler = new CommandHandler(false);
    const action = jest.fn();

    handler.addCommand({
      id: 'create_user',
      command: 'create user',
      parameters: [
        { name: 'fullName', type: 'string', required: true },
        { name: 'age', type: 'number', required: true },
      ],
      action,
    });

    const res = await handler.executeCommand({ commandId: 'create_user', params: { fullName: '   ', age: 30 } });

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'fullName')).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });

  it('asks for required number when out of range', async () => {
    const handler = new CommandHandler(false);
    const action = jest.fn();

    handler.addCommand({
      id: 'rate_service',
      command: 'rate service',
      parameters: [
        { name: 'comment', type: 'string', required: true },
        { name: 'score', type: 'number', required: true, min: 1, max: 5 },
      ],
      action,
    });

    const res = await handler.executeCommand({ commandId: 'rate_service', params: { comment: 'ok', score: 9 } });

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'score')).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });

  it('asks for select param when value is not in options', async () => {
    const handler = new CommandHandler(false);
    const action = jest.fn();

    handler.addCommand({
      id: 'choose_theme',
      command: 'choose theme',
      parameters: [
        { name: 'theme', type: 'select', required: true, options: [{ label: 'Blue', value: 'blue' }, { label: 'Red', value: 'red' }] },
      ],
      action,
    });

    const res = await handler.executeCommand({ commandId: 'choose_theme', params: { theme: 'green' } });

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'theme')).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });

  it('ignores AI-extracted params when allowAiParamExtraction is false', async () => {
    (globalThis as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'match',
        match: 'create_user',
        params: { fullName: 'guessed name' },
        incomplete: false,
        message: 'Creating user.',
      }),
    });

    const handler = new CommandHandler({ enableSmartIntent: true, intentEndpoint: 'http://example.test/intent' });
    const action = jest.fn();

    handler.addCommand({
      id: 'create_user',
      command: 'create user',
      allowAiParamExtraction: false,
      parameters: [
        { name: 'fullName', type: 'string', required: true },
      ],
      action,
    });

    const res = await handler.executeCommand('please create a user');

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'fullName')).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });
});
