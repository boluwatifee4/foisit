import { Route } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { PlaygroundComponent } from './playground/playground.component';

export const appRoutes: Route[] = [
  { path: '', component: LandingComponent },
  { path: 'playground', component: PlaygroundComponent },
  { path: '**', redirectTo: '' }
];
