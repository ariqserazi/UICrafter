import { generateFlutter } from "../generators/flutter";
import { generateHtmlCss } from "../generators/htmlCss";
import { generateReactTailwind } from "../generators/reactTailwind";
import type { OutputTarget, TemplateConfig, TemplateSummary, UICrafterTemplate } from "./types";
import { mobileTemplates } from "./mobileTemplates";
import { webTemplates } from "./webTemplates";

export const templates: UICrafterTemplate[] = [...webTemplates, ...mobileTemplates];

export function getTemplateById(templateId: string): UICrafterTemplate | undefined {
  return templates.find((template) => template.id === templateId);
}

export function summarizeTemplate(template: UICrafterTemplate): TemplateSummary {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    platform: template.platform,
    tags: template.tags,
    supportedTargets: template.supportedTargets,
    variants: template.variants,
    defaultConfig: template.defaultConfig
  };
}

export function generateForTarget(template: UICrafterTemplate, target: OutputTarget, config: TemplateConfig): string {
  if (!template.supportedTargets.includes(target)) {
    throw new Error(`${template.name} does not support ${target}.`);
  }

  if (target === "react-tailwind") {
    return (template.generateReactTailwind ?? generateReactTailwind)({ template, config });
  }

  if (target === "html-css") {
    return (template.generateHtmlCss ?? generateHtmlCss)({ template, config });
  }

  if (target === "flutter") {
    return (template.generateFlutter ?? generateFlutter)({ template, config });
  }

  throw new Error(`${target} is planned for a later UICrafter version.`);
}

export function getDefaultTarget(template: UICrafterTemplate, suggestedTarget?: OutputTarget): OutputTarget {
  if (suggestedTarget && template.supportedTargets.includes(suggestedTarget)) {
    return suggestedTarget;
  }

  return template.supportedTargets[0];
}

export function normalizeConfig(template: UICrafterTemplate, config?: Partial<TemplateConfig>): TemplateConfig {
  return {
    ...template.defaultConfig,
    ...config,
    variant: config?.variant && template.variants.some((variant) => variant.id === config.variant) ? config.variant : template.defaultConfig.variant
  };
}
