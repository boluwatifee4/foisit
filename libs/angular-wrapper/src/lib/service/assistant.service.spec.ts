import { TestBed } from '@angular/core/testing';

import { AssistantService } from './assistant.service';

describe('AssistantService', () => {
  let service: AssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: 'ASSISTANT_CONFIG', useValue: {
            activationCommand: 'activate',
            commands: [],
            fallbackResponse: 'I did not understand that',
            introMessage: 'Hello! How can I help you?'
          }
        }
      ]
    });
    service = TestBed.inject(AssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
