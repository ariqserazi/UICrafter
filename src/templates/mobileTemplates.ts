import { generateFlutter } from "../generators/flutter";
import { generateReactTailwind } from "../generators/reactTailwind";
import { buildPreviewHtml } from "./preview";
import type { OutputTarget, TemplateConfig, UICrafterTemplate } from "./types";

const baseConfig: TemplateConfig = {
  theme: "light",
  style: "modern",
  primaryColor: "#0f766e",
  radius: "2xl",
  density: "comfortable",
  font: "system",
  variant: "default",
  includeIcons: true,
  includeSampleData: true
};

const radiusConfig = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24
};

function mobileTemplate(input: {
  id: string;
  name: string;
  description: string;
  tags: string[];
  supportedTargets: OutputTarget[];
  layoutIntent: string;
  variants?: string[];
  defaultConfig?: Partial<TemplateConfig>;
}): UICrafterTemplate {
  const defaultConfig = { ...baseConfig, ...input.defaultConfig };
  const templateBase: Omit<UICrafterTemplate, "previewHtml"> = {
    id: input.id,
    name: input.name,
    description: input.description,
    category: input.id === "mobile-bottom-navigation" ? "Mobile components" : "Mobile screens",
    platform: "mobile",
    tags: input.tags,
    supportedTargets: input.supportedTargets,
    layoutIntent: input.layoutIntent,
    contentSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "sections", label: "Sections", type: "list" }
    ],
    themeConfig: defaultConfig,
    spacingConfig: { compact: 14, comfortable: 20, spacious: 28 },
    radiusConfig,
    previewData: { title: input.name },
    variants: (input.variants ?? ["default", "compact"]).map((variant) => ({ id: variant, name: variant.replace(/-/g, " ") })),
    defaultConfig,
    generateReactTailwind,
    generateFlutter: input.supportedTargets.includes("flutter") ? generateFlutter : undefined
  };

  return {
    ...templateBase,
    previewHtml: (config) => buildPreviewHtml(templateBase, config)
  };
}

export const mobileTemplates: UICrafterTemplate[] = [
  mobileTemplate({
    id: "mobile-profile-screen",
    name: "Mobile profile screen",
    description: "A profile view with avatar, stats, and a primary action.",
    tags: ["mobile", "profile", "user"],
    supportedTargets: ["react-tailwind", "flutter"],
    layoutIntent: "Present a person or creator with key stats and a follow action.",
    variants: ["default", "creator", "compact"]
  }),
  mobileTemplate({
    id: "mobile-settings-screen",
    name: "Mobile settings screen",
    description: "A native-feeling settings list with tappable rows.",
    tags: ["mobile", "settings", "list"],
    supportedTargets: ["react-tailwind", "flutter"],
    layoutIntent: "Organize mobile preferences into clear, tappable sections.",
    variants: ["default", "grouped", "compact"]
  }),
  mobileTemplate({
    id: "mobile-bottom-navigation",
    name: "Mobile bottom navigation",
    description: "A mobile app shell with a bottom tab navigation pattern.",
    tags: ["mobile", "navigation", "tabs"],
    supportedTargets: ["react-tailwind", "flutter"],
    layoutIntent: "Give mobile screens a familiar four-tab navigation structure.",
    variants: ["default", "floating", "minimal"]
  })
];
