import { generateFlutter } from "../generators/flutter";
import { generateHtmlCss } from "../generators/htmlCss";
import { generateReactTailwind } from "../generators/reactTailwind";
import { buildPreviewHtml } from "./preview";
import type { OutputTarget, TemplateCategory, TemplateConfig, UICrafterTemplate, PlatformType } from "./types";

const baseConfig: TemplateConfig = {
  theme: "light",
  style: "modern",
  primaryColor: "#2563eb",
  radius: "xl",
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

function template(input: {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platform?: PlatformType;
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
    category: input.category,
    platform: input.platform ?? "web",
    tags: input.tags,
    supportedTargets: input.supportedTargets,
    layoutIntent: input.layoutIntent,
    contentSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "items", label: "Items", type: "list" }
    ],
    themeConfig: defaultConfig,
    spacingConfig: { compact: 14, comfortable: 20, spacious: 28 },
    radiusConfig,
    previewData: { title: input.name },
    variants: (input.variants ?? ["default", "compact"]).map((variant) => ({ id: variant, name: variant.replace(/-/g, " ") })),
    defaultConfig,
    generateReactTailwind,
    generateHtmlCss: input.supportedTargets.includes("html-css") ? generateHtmlCss : undefined,
    generateFlutter: input.supportedTargets.includes("flutter") ? generateFlutter : undefined
  };

  return {
    ...templateBase,
    previewHtml: (config) => buildPreviewHtml(templateBase, config)
  };
}

export const webTemplates: UICrafterTemplate[] = [
  template({
    id: "saas-hero-section",
    name: "SaaS hero section",
    description: "A focused landing hero with calls to action and a product preview card.",
    category: "Web sections",
    tags: ["landing", "hero", "saas", "marketing"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Introduce a product and guide users toward a primary action.",
    variants: ["default", "split-preview", "compact"]
  }),
  template({
    id: "login-card",
    name: "Login card",
    description: "A clean sign-in card that works for web and mobile-style flows.",
    category: "Cross platform",
    platform: "cross-platform",
    tags: ["auth", "form", "account"],
    supportedTargets: ["react-tailwind", "html-css", "flutter"],
    layoutIntent: "Help a returning user authenticate with minimal friction.",
    variants: ["default", "centered", "brand"]
  }),
  template({
    id: "pricing-section",
    name: "Three tier pricing section",
    description: "Three pricing cards with a highlighted middle plan.",
    category: "Web sections",
    tags: ["pricing", "billing", "saas"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Compare plans and nudge users to the recommended option.",
    variants: ["default", "highlighted", "minimal"]
  }),
  template({
    id: "responsive-navbar",
    name: "Responsive navbar",
    description: "A compact navigation bar with brand, links, and a CTA.",
    category: "Navigation",
    tags: ["nav", "header", "responsive"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Provide top-level site navigation that scales down cleanly.",
    variants: ["default", "centered", "minimal"]
  }),
  template({
    id: "feature-card-grid",
    name: "Feature card grid",
    description: "A responsive grid for product features or benefits.",
    category: "Web components",
    tags: ["features", "grid", "cards"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Explain multiple capabilities using scan-friendly feature cards.",
    variants: ["default", "icons", "dense"]
  }),
  template({
    id: "analytics-dashboard-layout",
    name: "Analytics dashboard layout",
    description: "A dashboard shell with sidebar, metric cards, and an activity chart.",
    category: "Dashboards",
    tags: ["dashboard", "analytics", "admin"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Summarize operational metrics and provide a calm dashboard frame.",
    variants: ["default", "compact", "sidebar"]
  }),
  template({
    id: "portfolio-project-grid",
    name: "Portfolio project grid",
    description: "A polished project grid for creative portfolios and case studies.",
    category: "Portfolio",
    tags: ["portfolio", "projects", "case-study"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Show selected projects with enough structure for quick evaluation.",
    variants: ["default", "editorial", "compact"]
  }),
  template({
    id: "empty-state-card",
    name: "Empty state card",
    description: "A friendly empty state with icon, explanation, and action.",
    category: "Cross platform",
    platform: "cross-platform",
    tags: ["empty", "state", "onboarding"],
    supportedTargets: ["react-tailwind", "html-css", "flutter"],
    layoutIntent: "Explain an empty surface and invite the next useful action.",
    variants: ["default", "action", "quiet"]
  }),
  template({
    id: "product-card",
    name: "Product card",
    description: "A compact ecommerce product card with image, copy, price, and CTA.",
    category: "Ecommerce",
    tags: ["product", "card", "commerce"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Present a sellable item with a clear add-to-cart action.",
    variants: ["default", "compact", "premium"]
  }),
  template({
    id: "checkout-form",
    name: "Checkout form",
    description: "A simple checkout form with contact and address fields.",
    category: "Forms",
    tags: ["checkout", "form", "commerce"],
    supportedTargets: ["react-tailwind", "html-css"],
    layoutIntent: "Collect purchase details using a readable, low-friction form.",
    variants: ["default", "compact", "stacked"]
  }),
  template({
    id: "account-settings-panel",
    name: "Account settings panel",
    description: "A settings panel with navigation and editable profile fields.",
    category: "Admin UI",
    platform: "cross-platform",
    tags: ["settings", "account", "admin"],
    supportedTargets: ["react-tailwind", "html-css", "flutter"],
    layoutIntent: "Let users manage profile details and account preferences.",
    variants: ["default", "tabs", "compact"]
  })
];
