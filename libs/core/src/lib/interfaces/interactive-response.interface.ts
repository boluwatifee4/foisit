import type { AssistantParameter } from './assistant-command.interface';

export type InteractiveOption = {
  label: string;
  /** Optional structured value to submit (falls back to label) */
  value?: string;
  /** Optional ID for display/debug; not required for UI clicks */
  commandId?: string;
};

export interface InteractiveResponse {
  message: string;
  type:
  | 'success'
  | 'error'
  | 'question'
  | 'suggestion'
  | 'form'
  | 'ambiguous'
  | 'confirm';
  options?: InteractiveOption[];
  /** Used when type==='form' */
  fields?: AssistantParameter[];
}
