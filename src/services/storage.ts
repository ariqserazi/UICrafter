import * as vscode from "vscode";
import type { OutputTarget, PlatformType, TemplateCategory, TemplateConfig } from "../templates/types";

const keys = {
  favorites: "uicrafter.favorites",
  recents: "uicrafter.recents",
  lastTarget: "uicrafter.lastTarget",
  lastConfig: "uicrafter.lastConfig",
  lastCategory: "uicrafter.lastCategory",
  lastPlatformFilter: "uicrafter.lastPlatformFilter",
  lastTemplate: "uicrafter.lastTemplate"
};

export type PlatformFilter = "all" | PlatformType;

export interface PersistedUICrafterState {
  favorites: string[];
  recents: string[];
  lastTarget?: OutputTarget;
  lastConfig?: Partial<TemplateConfig>;
  lastCategory?: TemplateCategory | "All";
  lastPlatformFilter?: PlatformFilter;
  lastTemplate?: string;
}

export class UICrafterStorage {
  constructor(private readonly context: vscode.ExtensionContext) {}

  getState(): PersistedUICrafterState {
    return {
      favorites: this.context.globalState.get<string[]>(keys.favorites, []),
      recents: this.context.globalState.get<string[]>(keys.recents, []),
      lastTarget: this.context.globalState.get<OutputTarget>(keys.lastTarget),
      lastConfig: this.context.globalState.get<Partial<TemplateConfig>>(keys.lastConfig),
      lastCategory: this.context.globalState.get<TemplateCategory | "All">(keys.lastCategory, "All"),
      lastPlatformFilter: this.context.globalState.get<PlatformFilter>(keys.lastPlatformFilter, "all"),
      lastTemplate: this.context.globalState.get<string>(keys.lastTemplate)
    };
  }

  async toggleFavorite(templateId: string): Promise<string[]> {
    const favorites = this.getState().favorites;
    const next = favorites.includes(templateId)
      ? favorites.filter((favorite) => favorite !== templateId)
      : [templateId, ...favorites];
    await this.context.globalState.update(keys.favorites, next);
    return next;
  }

  async rememberTemplate(templateId: string): Promise<void> {
    const recents = this.getState().recents.filter((recent) => recent !== templateId);
    await Promise.all([
      this.context.globalState.update(keys.recents, [templateId, ...recents].slice(0, 8)),
      this.context.globalState.update(keys.lastTemplate, templateId)
    ]);
  }

  async rememberTarget(target: OutputTarget): Promise<void> {
    await this.context.globalState.update(keys.lastTarget, target);
  }

  async rememberConfig(config: TemplateConfig): Promise<void> {
    await this.context.globalState.update(keys.lastConfig, config);
  }

  async rememberCategory(category: TemplateCategory | "All"): Promise<void> {
    await this.context.globalState.update(keys.lastCategory, category);
  }

  async rememberPlatformFilter(filter: PlatformFilter): Promise<void> {
    await this.context.globalState.update(keys.lastPlatformFilter, filter);
  }
}
