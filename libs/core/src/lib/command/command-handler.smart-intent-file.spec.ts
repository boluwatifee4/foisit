import { CommandHandler } from './command-handler';

describe('CommandHandler smart intent (file params)', () => {
  beforeEach(() => {
    (globalThis as any).fetch = jest.fn();
  });

  it('returns a form (not a question) when missing required file param', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'match',
        match: 'upload_file',
        params: {},
        incomplete: true,
        message: 'Please pick a file to upload.',
      }),
    });

    const handler = new CommandHandler({
      enableSmartIntent: true,
      intentEndpoint: 'http://example.test/intent',
    });

    handler.addCommand({
      id: 'upload_file',
      command: 'upload file',
      description: 'Pick a file and return it to the action (demo)',
      parameters: [
        {
          name: 'attachment',
          description: 'Select a file',
          required: true,
          type: 'file',
          accept: ['image/*'],
          multiple: false,
          delivery: 'file',
        },
      ],
      action: async () => ({ type: 'success', message: 'ok' }),
    } as any);

    const res = await handler.executeCommand('i need to upload stuffs');

    expect(res.type).toBe('form');
    expect(res.message).toContain('Please pick a file to upload.');
    expect(res.fields?.some((f) => f.name === 'attachment' && f.type === 'file')).toBe(true);
  });

  it('treats textual "attachment" param as missing and returns a form', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'match',
        match: 'upload_file',
        params: { attachment: 'csv file' },
        incomplete: false,
        message: 'OK, uploading.',
      }),
    });

    const handler = new CommandHandler({
      enableSmartIntent: true,
      intentEndpoint: 'http://example.test/intent',
    });

    handler.addCommand({
      id: 'upload_file',
      command: 'upload file',
      description: 'Pick a file and return it to the action (demo)',
      parameters: [
        {
          name: 'attachment',
          description: 'Select a file',
          required: true,
          type: 'file',
          accept: ['text/csv'],
          multiple: false,
          delivery: 'file',
        },
      ],
      action: async () => ({ type: 'success', message: 'ok' }),
    } as any);

    const res = await handler.executeCommand('let\'s upload a file');

    expect(res.type).toBe('form');
    expect(res.fields?.some((f) => f.name === 'attachment' && f.type === 'file')).toBe(true);
  });

  it('accepts base64 string when delivery=base64', async () => {
    const dataUrl = 'data:text/csv;base64,SGVsbG8sV29ybGQ=';

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'match',
        match: 'upload_file',
        params: { attachment: dataUrl },
        incomplete: false,
        message: 'I have the file in base64.',
      }),
    });

    const handler = new CommandHandler({
      enableSmartIntent: true,
      intentEndpoint: 'http://example.test/intent',
    });

    handler.addCommand({
      id: 'upload_file',
      command: 'upload file',
      description: 'Pick a file and return it to the action (demo)',
      parameters: [
        {
          name: 'attachment',
          description: 'Select a file',
          required: true,
          type: 'file',
          accept: ['text/csv'],
          multiple: false,
          delivery: 'base64',
        },
      ],
      action: async (params: any) => {
        // Should accept data URL string when delivery is base64
        if (typeof params?.attachment === 'string' && params.attachment.startsWith('data:')) {
          return { type: 'success', message: 'received base64' };
        }
        return { type: 'error', message: 'invalid' };
      },
    } as any);

    const res = await handler.executeCommand('upload this file');
    expect(res.type).toBe('success');
    expect(res.message).toContain('received base64');
  });
});
