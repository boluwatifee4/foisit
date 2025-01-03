import { ModuleWithProviders, NgModule } from '@angular/core';
import { AssistantService } from './service/assistant.service';
import { AssistantConfig } from '@foisit/core';

@NgModule({})
export class AssistantModule {
  static forRoot(config: AssistantConfig): ModuleWithProviders<AssistantModule> {
    return {
      ngModule: AssistantModule,
      providers: [
        { provide: 'ASSISTANT_CONFIG', useValue: config },
        AssistantService,
      ],
    };
  }
}
