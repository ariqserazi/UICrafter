import type { TemplateConfig, UICrafterTemplate } from "../templates/types";

export interface GenerateRequest {
  template: UICrafterTemplate;
  config: TemplateConfig;
}

export type GenerateFunction = (request: GenerateRequest) => string;

export interface GeneratedCodeResult {
  code: string;
  targetLabel: string;
}
