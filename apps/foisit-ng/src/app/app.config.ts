import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { AssistantModule, ThemeColors } from '@foisit/angular-wrapper';

// ============================================================================
// Overlay Theme Presets
// ============================================================================
type OverlayThemePreset = 'glass' | 'dark-navy' | 'catppuccin' | 'midnight';

const OVERLAY_THEME_PRESETS: Record<
  OverlayThemePreset,
  { theme: 'glass' | 'solid'; themeColors?: ThemeColors }
> = {
  glass: {
    theme: 'glass',
  },
  'dark-navy': {
    theme: 'solid',
    themeColors: {
      background: '#1a1a2e',
      text: '#ffffff',
      accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      userBubbleBg: 'rgba(102, 126, 234, 0.2)',
      systemBubbleBg: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  },
  catppuccin: {
    theme: 'solid',
    themeColors: {
      background: '#1e1e2e',
      text: '#cdd6f4',
      accent: '#89b4fa',
      userBubbleBg: 'rgba(137, 180, 250, 0.15)',
      systemBubbleBg: 'rgba(49, 50, 68, 0.8)',
      border: 'rgba(88, 91, 112, 0.5)',
    },
  },
  midnight: {
    theme: 'solid',
    themeColors: {
      background: '#0a0a0a',
      text: '#00ff88',
      accent: '#00ff88',
      userBubbleBg: 'rgba(0, 255, 136, 0.1)',
      systemBubbleBg: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(0, 255, 136, 0.2)',
    },
  },
};

// Read overlay theme from localStorage (SSR-safe)
function getOverlayThemeConfig(): {
  theme: 'glass' | 'solid';
  themeColors?: ThemeColors;
} {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return OVERLAY_THEME_PRESETS['glass'];
  }
  const saved = localStorage.getItem(
    'foisit-overlay-theme'
  ) as OverlayThemePreset | null;
  return (
    OVERLAY_THEME_PRESETS[saved || 'glass'] || OVERLAY_THEME_PRESETS['glass']
  );
}

const overlayTheme = getOverlayThemeConfig();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    importProvidersFrom(
      AssistantModule.forRoot({
        activationCommand: 'bad',
        introMessage: 'Hello from Angular!',
        fallbackResponse: "Sorry, I didn't understand that.",
        enableSmartIntent: true,
        inputPlaceholder: 'Ask Foisit anything...',
        floatingButton: {
          visible: true,
          tooltip: 'Click to start chatting',
          customHtml:
            '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;">🤖</div>',
          position: { bottom: '30px', right: '30px' },
        },
        theme: overlayTheme.theme,
        themeColors: overlayTheme.themeColors,
        commands: [
          {
            command: 'show profile',
            action: () => alert('Showing profile...'),
          },
          { command: 'log out', action: () => console.log('Logging out...') },
          {
            command: 'delete account',
            description: 'delete your account permanently',
            critical: true,
            action: () => alert('Account deleted! (Demo)'),
          },
        ],
      })
    ),
  ],
};
