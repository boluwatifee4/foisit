import { AssistantCommand } from './assistant-command.interface';

/**
 * Custom color configuration for solid theme.
 * All colors are optional - defaults will be used for any not specified.
 */
export interface ThemeColors {
  /** Background color (e.g., '#1e1e2e') */
  background?: string;
  /** Primary text color (e.g., '#ffffff') */
  text?: string;
  /** Accent color for buttons, highlights, gradients (e.g., '#89b4fa' or gradient string) */
  accent?: string;
  /** User message bubble background (e.g., 'rgba(137, 180, 250, 0.2)') */
  userBubbleBg?: string;
  /** System message bubble background (e.g., 'rgba(255, 255, 255, 0.05)') */
  systemBubbleBg?: string;
  /** Border color (e.g., 'rgba(255, 255, 255, 0.1)') */
  border?: string;
}

export interface AssistantConfig {
  activationCommand?: string;
  fallbackResponse?: string;
  commands: AssistantCommand[];
  introMessage?: string;
  enableSmartIntent?: boolean;
  /** Override where intent resolution requests are sent (defaults to hosted proxy). */
  intentEndpoint?: string;
  inputPlaceholder?: string;
  enableGestureActivation?: boolean;
  floatingButton?: {
    visible?: boolean;
    tooltip?: string;
    customHtml?: string;
    position?: { bottom: string; right: string };
  };
  /**
   * Theme mode for the overlay UI.
   * - 'glass' (default): Glassmorphism with blur effects
   * - 'solid': Opaque backgrounds with customizable colors
   */
  theme?: 'glass' | 'solid';
  /**
   * Custom colors for solid theme. Ignored when theme is 'glass'.
   * Any colors not specified will use defaults (dark navy + white + purple-blue gradient).
   */
  themeColors?: ThemeColors;
}
