/* eslint-disable no-unused-vars */

import { InteractiveResponse } from './interactive-response.interface';

export type SelectOption = { label: string; value: string };
export type AssistantCommandParams = Record<string, unknown>;

export interface StringParameter {
  name: string;
  description?: string;
  required?: boolean;
  type: 'string';
  placeholder?: string;
  defaultValue?: string;
}

export interface NumberParameter {
  name: string;
  description?: string;
  required?: boolean;
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export interface DateParameter {
  name: string;
  description?: string;
  required?: boolean;
  type: 'date';
  min?: string;
  max?: string;
  defaultValue?: string;
}

export interface SelectParameter {
  name: string;
  description?: string;
  required?: boolean;
  type: 'select';
  options?: SelectOption[];
  getOptions?: () => Promise<SelectOption[]>;
  defaultValue?: string;
}

export interface FileParameter {
  name: string;
  description?: string;
  required?: boolean;
  type: 'file';
  /** Allowed mime types or extensions (e.g. ['image/jpeg','image/png'] or ['.jpg','.png']) */
  accept?: string[];
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Max size per file in bytes */
  maxSizeBytes?: number;
  /** Max total size for all files in bytes */
  maxTotalBytes?: number;
  /** For media: max duration in seconds */
  maxDurationSec?: number;
  /** For images: maximum width/height */
  maxWidth?: number;
  maxHeight?: number;
  /** How the file should be delivered back to the action: 'file' | 'base64' */
  delivery?: 'file' | 'base64';
  /** Capture hint for mobile devices ('camera' | 'microphone') */
  capture?: 'camera' | 'microphone' | boolean;
}

export type AssistantParameter =
  | StringParameter
  | NumberParameter
  | DateParameter
  | SelectParameter
  | FileParameter;

export interface AssistantCommand {
  id?: string;
  command: string;
  description?: string;
  /** Alternative deterministic triggers (non-AI) */
  keywords?: string[];
  /** Requires explicit user confirmation before running */
  critical?: boolean;
  parameters?: AssistantParameter[];
  action: (
    params?: AssistantCommandParams
  ) => Promise<string | InteractiveResponse | void> | void;
}
