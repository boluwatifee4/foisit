import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <header
      style="position: fixed; top: 0; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: 12px 8%; z-index: 1000; display: flex; justify-content: center; align-items: center; gap: 12px;"
    >
      <a
        href="https://github.com/AstroBookings/foisit"
        target="_blank"
        rel="noreferrer"
        aria-label="View project on GitHub"
        style="color: var(--text-secondary); display: inline-flex;"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      </a>
      <a
        href="https://www.npmjs.com/package/@foisit/angular-wrapper"
        target="_blank"
        rel="noreferrer"
        aria-label="View package on npm"
        style="color: var(--text-secondary); display: inline-flex;"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <rect
            x="0"
            y="6"
            width="24"
            height="12"
            rx="2"
            ry="2"
            fill="currentColor"
          />
          <text x="4" y="14" font-size="8" fill="#fff" font-family="sans-serif">
            npm
          </text>
        </svg>
      </a>
      <a
        href="https://foisit-react.netlify.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="View React demo"
        style="display: inline-flex;"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
          alt="View React demo"
          style="width: 28px; height: 28px; object-fit: contain;"
        />
      </a>
      <a
        href="https://foisit-vue.netlify.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="View Vue demo"
        style="display: inline-flex;"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/960px-Vue.js_Logo_2.svg.png"
          alt="View Vue demo"
          style="width: 28px; height: 28px; object-fit: contain;"
        />
      </a>
    </header>
    <div style="padding-top: 60px;">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class AppComponent {
  constructor(private assistantService: AssistantService) {}
}
