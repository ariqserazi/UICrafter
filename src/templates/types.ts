import type { GenerateFunction } from "../generators/types";

export type OutputTarget =
  | "react-tailwind"
  | "html-css"
  | "flutter"
  | "react-native"
  | "swiftui"
  | "jetpack-compose"
  | "vue"
  | "svelte";

export type PlatformType = "web" | "mobile" | "cross-platform";

export type TemplateCategory =
  | "Web sections"
  | "Web components"
  | "Dashboards"
  | "Forms"
  | "Navigation"
  | "Mobile screens"
  | "Mobile components"
  | "Ecommerce"
  | "Portfolio"
  | "Admin UI"
  | "Cross platform";

export type TemplateTheme = "light" | "dark";
export type TemplateStyle = "minimal" | "modern" | "premium" | "playful";
export type TemplateRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type TemplateDensity = "compact" | "comfortable" | "spacious";
export type TemplateFont = "system" | "inter" | "poppins";

export interface TemplateConfig {
  theme: TemplateTheme;
  style: TemplateStyle;
  primaryColor: string;
  radius: TemplateRadius;
  density: TemplateDensity;
  font: TemplateFont;
  variant: string;
  includeIcons: boolean;
  includeSampleData: boolean;
}

export interface TemplateContentField {
  key: string;
  label: string;
  type: "text" | "number" | "image" | "list" | "boolean";
}

export interface TemplateVariant {
  id: string;
  name: string;
}

export interface UICrafterTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platform: PlatformType;
  tags: string[];
  supportedTargets: OutputTarget[];
  layoutIntent: string;
  contentSchema: TemplateContentField[];
  themeConfig: Partial<TemplateConfig>;
  spacingConfig: {
    compact: number;
    comfortable: number;
    spacious: number;
  };
  radiusConfig: Record<TemplateRadius, number>;
  previewData: Record<string, unknown>;
  variants: TemplateVariant[];
  defaultConfig: TemplateConfig;
  previewHtml: (config: TemplateConfig) => string;
  generateReactTailwind?: GenerateFunction;
  generateHtmlCss?: GenerateFunction;
  generateFlutter?: GenerateFunction;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platform: PlatformType;
  tags: string[];
  supportedTargets: OutputTarget[];
  variants: TemplateVariant[];
  defaultConfig: TemplateConfig;
}

export const outputTargetLabels: Record<OutputTarget, string> = {
  "react-tailwind": "React + Tailwind",
  "html-css": "HTML + CSS",
  flutter: "Flutter",
  "react-native": "React Native",
  swiftui: "SwiftUI",
  "jetpack-compose": "Jetpack Compose",
  vue: "Vue",
  svelte: "Svelte"
};

export const categories: TemplateCategory[] = [
  "Web sections",
  "Web components",
  "Dashboards",
  "Forms",
  "Navigation",
  "Mobile screens",
  "Mobile components",
  "Ecommerce",
  "Portfolio",
  "Admin UI",
  "Cross platform"
];
