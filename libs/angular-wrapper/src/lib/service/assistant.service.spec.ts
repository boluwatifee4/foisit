import { TestBed } from '@angular/core/testing';
import { AssistantService } from './assistant.service';

describe('AssistantService', () => {
  let service: AssistantService;

  const mockConfig = {
    activationCommand: 'activate',
    enableSmartIntent: false,
    commands: [
      { command: 'say hello', action: jest.fn() },
    ],
    fallbackResponse: 'I did not understand that',
    introMessage: 'Hello! How can I help you?',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: 'ASSISTANT_CONFIG',
          useValue: mockConfig,
        },
      ],
    });
    service = TestBed.inject(AssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a command dynamically', () => {
    const newCommand = 'goodbye';
    const newAction = jest.fn();

    service.addCommand(newCommand, newAction);
    return service['commandHandler'].executeCommand(newCommand).then(() => {
      expect(newAction).toHaveBeenCalled();
    });
  });

  it('should remove a command dynamically', async () => {
    const commandToRemove = 'say hello';

    service.removeCommand(commandToRemove);
    const executed = await service['commandHandler'].executeCommand(commandToRemove);
    expect(executed.type).toBe('error');
  });

  it('should activate when the activation command is spoken', async () => {
    jest.spyOn(service['textToSpeech'], 'speak');

    await service['processActivation']('activate');

    expect(service['isActivated']).toBe(true);
    expect(service['textToSpeech'].speak).toHaveBeenCalledWith(
      mockConfig.introMessage
    );
  });

  it('should not activate for incorrect activation commands', async () => {
    jest.spyOn(service['textToSpeech'], 'speak');

    await service['processActivation']('random command');

    expect(service['isActivated']).toBe(false);
    expect(service['textToSpeech'].speak).not.toHaveBeenCalled();
  });

  it('should handle a recognized command', async () => {
    const command = 'say hello';
    await service['handleCommand'](command);

    expect(mockConfig.commands[0].action).toHaveBeenCalled();
  });

  it('should handle unrecognized commands with fallback', async () => {
    jest.spyOn(service['fallbackHandler'], 'handleFallback');

    const unrecognizedCommand = 'unknown command';
    await service['handleCommand'](unrecognizedCommand);

    expect(service['fallbackHandler'].handleFallback).toHaveBeenCalledWith(
      unrecognizedCommand
    );
  });

  it('should stop listening', () => {
    service.stopListening();
    expect(service['isActivated']).toBe(false);
  });
});
