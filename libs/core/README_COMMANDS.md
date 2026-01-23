# Command Handlers (programmatic)

This document shows how to register and invoke programmatic commands using the `OverlayManager` and the wrapper `AssistantService` APIs.

Core API (in `OverlayManager`):

- `registerCommandHandler(commandId: string, handler: (params?: any) => Promise<any> | any)` — register a handler.
- `unregisterCommandHandler(commandId: string)` — remove a handler.
- `runCommand({ commandId, params?, openOverlay?, showInvocation? })` — invoke a registered handler and display the result in the overlay.

Wrapper APIs:

- `assistantService.registerCommandHandler(commandId, handler)`
- `assistantService.unregisterCommandHandler(commandId)`
- `assistantService.runCommand(options)`

Example (in your app code — React / Vue / Angular app):

```ts
// Register
assistantService.registerCommandHandler('escalate', async (params) => {
  // call your API or perform local work
  const resp = await apiClient.post('/incidents/escalate', params);
  return resp.message || JSON.stringify(resp);
});

// Run programmatically where needed
assistantService.runCommand({ commandId: 'escalate', params: { id: 123 }, openOverlay: true, showInvocation: true });
```

Notes:

- The library does not register any default commands. Provide handlers in your app (see above) or via wrapper-level initialization where appropriate.
- `runCommand` will open the overlay if `openOverlay` is true, and will show invocation messages if `showInvocation` is true.
