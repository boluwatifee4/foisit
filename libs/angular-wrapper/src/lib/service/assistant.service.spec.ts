import { TestBed } from '@angular/core/testing';
import { AssistantService } from './assistant.service';

describe('AssistantService', () => {
  let service: AssistantService;

  const mockConfig = {
    activationCommand: 'activate',
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
    service['commandHandler'].executeCommand(newCommand);

    expect(newAction).toHaveBeenCalled();
  });

  it('should remove a command dynamically', () => {
    const commandToRemove = 'say hello';

    service.removeCommand(commandToRemove);
    const executed = service['commandHandler'].executeCommand(commandToRemove);

    expect(executed).toBe(false); // The command should no longer exist
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
    jest.spyOn(service['voiceProcessor'], 'stopListening');
    jest.spyOn(service['stateManager'], 'setState');

    service.stopListening();

    expect(service['voiceProcessor'].stopListening).toHaveBeenCalled();
    expect(service['stateManager'].setState).toHaveBeenCalledWith('idle');
    expect(service['isActivated']).toBe(false);
  });

  it('should toggle assistant state on double-tap/click', () => {
    jest.spyOn(service, 'stopListening');
    jest.spyOn(service, 'startListening');

    service['isActivated'] = true;
    service['toggleAssistantState']();

    expect(service.stopListening).toHaveBeenCalled();

    service['isActivated'] = false;
    service['toggleAssistantState']();

    expect(service.startListening).toHaveBeenCalled();
  });
});
