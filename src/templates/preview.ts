import type { TemplateConfig, UICrafterTemplate } from "./types";
import { escapeHtml } from "../utils/stringUtils";

const radiusPixels = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24
};

const density = {
  compact: { pad: 14, gap: 10 },
  comfortable: { pad: 20, gap: 14 },
  spacious: { pad: 28, gap: 18 }
};

export function buildPreviewHtml(template: Pick<UICrafterTemplate, "id" | "name" | "platform">, config: TemplateConfig): string {
  const tokens = previewTokens(config);
  const content = renderPreview(template.id, template.name, tokens);
  const width = template.platform === "mobile" ? "390px" : "100%";

  return `<div style="${style({
    color: tokens.text,
    background: tokens.background,
    fontFamily: tokens.font,
    width,
    maxWidth: "100%",
    margin: "0 auto",
    borderRadius: `${tokens.radius}px`,
    overflow: "hidden"
  })}">${content}</div>`;
}

function previewTokens(config: TemplateConfig) {
  return {
    background: config.theme === "dark" ? "#09090b" : "#ffffff",
    surface: config.theme === "dark" ? "#18181b" : "#ffffff",
    subtle: config.theme === "dark" ? "#27272a" : "#f4f4f5",
    border: config.theme === "dark" ? "#27272a" : "#e4e4e7",
    text: config.theme === "dark" ? "#fafafa" : "#18181b",
    muted: config.theme === "dark" ? "#a1a1aa" : "#52525b",
    primary: config.primaryColor,
    radius: radiusPixels[config.radius],
    pad: density[config.density].pad,
    gap: density[config.density].gap,
    font:
      config.font === "system"
        ? "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        : config.font === "inter"
          ? "Inter, system-ui, sans-serif"
          : "Poppins, system-ui, sans-serif",
    icons: config.includeIcons,
    sample: config.includeSampleData
  };
}

function renderPreview(id: string, name: string, t: ReturnType<typeof previewTokens>): string {
  switch (id) {
    case "saas-hero-section":
      return section(t, `<div style="${style({ display: "grid", gap: "22px" })}">
        ${pill("Launch faster", t)}
        <div>
          <h1 style="${heading(40)}">Ship polished interfaces without starting from zero.</h1>
          <p style="${copy(t)}">Reusable templates, live previews, and paste-ready code for product teams.</p>
        </div>
        <div style="${style({ display: "flex", gap: "10px", flexWrap: "wrap" })}">
          ${button("Start crafting", t, true)}
          ${button("View templates", t, false)}
        </div>
      </div>
      <div style="${card(t)}">
        <div style="${style({ height: "150px", borderRadius: `${Math.max(t.radius - 4, 0)}px`, background: `linear-gradient(135deg, ${t.primary}33, ${t.subtle})`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "14px" })}">
          ${miniBlock("Hero", t)}${miniBlock("Forms", t)}${miniBlock("Pricing", t)}${miniBlock("Mobile", t)}
        </div>
      </div>`, "two");

    case "pricing-section":
      return section(t, `<div style="${style({ gridColumn: "1 / -1" })}"><h2 style="${heading(28)}">Simple pricing for growing teams</h2><p style="${copy(t)}">Pick a focused plan and keep moving.</p></div>
        ${["Starter", "Pro", "Scale"].map((plan, index) => `<article style="${card(t, index === 1)}"><p style="${style({ color: index === 1 ? t.primary : t.muted, margin: 0, fontWeight: "700" })}">${plan}</p><h3 style="${heading(32)}">$${index === 0 ? "19" : index === 1 ? "49" : "99"}</h3><p style="${copy(t)}">Templates, previews, and clean exports.</p>${button("Choose plan", t, index === 1)}</article>`).join("")}`, "three");

    case "responsive-navbar":
      return `<nav style="${style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", padding: `${t.pad}px`, borderBottom: `1px solid ${t.border}` })}">
        <strong style="${style({ display: "flex", alignItems: "center", gap: "10px" })}"><span style="${style({ width: "34px", height: "34px", borderRadius: `${t.radius}px`, background: t.primary })}"></span>UICrafter</strong>
        <div style="${style({ display: "flex", gap: "16px", color: t.muted, fontSize: "13px" })}"><span>Templates</span><span>Preview</span><span>Export</span></div>
        ${button("Start", t, true)}
      </nav>`;

    case "feature-card-grid":
      return section(t, `<div style="${style({ gridColumn: "1 / -1" })}"><h2 style="${heading(28)}">Everything your UI workflow needs</h2><p style="${copy(t)}">Small helpers for common product screens.</p></div>
        ${["Preview", "Customize", "Export", "Favorite", "Create", "Native"].map((item) => `<article style="${card(t)}">${icon(t)}<h3 style="${heading(17)}">${item}</h3><p style="${copy(t)}">Focused controls and readable generated code.</p></article>`).join("")}`, "three");

    case "analytics-dashboard-layout":
      return section(t, `<aside style="${card(t)}"><h2 style="${heading(20)}">Dashboard</h2><p style="${copy(t)}">Overview<br />Traffic<br />Revenue<br />Settings</p></aside>
        <main style="${style({ display: "grid", gap: `${t.gap}px` })}">
          <div style="${style({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: `${t.gap}px` })}">${["$48.2k", "12.8k", "8.4%"].map((item) => `<div style="${card(t)}"><p style="${copy(t)}">Metric</p><h3 style="${heading(24)}">${item}</h3></div>`).join("")}</div>
          <div style="${card(t)}"><h3 style="${heading(18)}">Weekly activity</h3><div style="${style({ height: "130px", display: "flex", alignItems: "end", gap: "8px" })}">${[42, 68, 54, 88, 72, 95, 81].map((height) => `<span style="${style({ flex: "1", height: `${height}%`, background: t.primary, borderRadius: "8px 8px 0 0" })}"></span>`).join("")}</div></div>
        </main>`, "dashboard");

    case "mobile-profile-screen":
      return mobileShell(t, `<div style="${card(t)}"><div style="${style({ display: "flex", alignItems: "center", gap: "14px" })}"><span style="${avatar(t)}"></span><div><h2 style="${heading(22)}">Alex Morgan</h2><p style="${copy(t)}">Product designer</p></div></div><div style="${style({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "22px 0" })}">${["24", "1.8k", "128"].map((item) => `<div style="${style({ background: t.subtle, borderRadius: "14px", padding: "12px", textAlign: "center" })}"><strong>${item}</strong><p style="${copy(t, 12)}">Stats</p></div>`).join("")}</div>${button("Follow", t, true, true)}</div>`);

    case "mobile-settings-screen":
      return mobileShell(t, `<h2 style="${heading(26)}">Settings</h2><div style="${style({ display: "grid", gap: "10px", marginTop: "16px" })}">${["Notifications", "Privacy", "Appearance", "Billing"].map((item) => `<div style="${row(t)}"><span>${item}</span><span style="${style({ color: t.muted })}">›</span></div>`).join("")}</div>`);

    case "portfolio-project-grid":
      return section(t, `<div style="${style({ gridColumn: "1 / -1" })}"><h2 style="${heading(28)}">Selected work</h2><p style="${copy(t)}">A polished grid for case studies.</p></div>${["Studio OS", "Atlas App", "Nova Store"].map((item) => `<article style="${card(t)}"><div style="${style({ height: "105px", borderRadius: `${Math.max(t.radius - 4, 0)}px`, background: `${t.primary}2b`, marginBottom: "14px" })}"></div><h3 style="${heading(17)}">${item}</h3><p style="${copy(t)}">Brand, product, and interface design.</p></article>`).join("")}`, "three");

    case "empty-state-card":
      return `<section style="${style({ minHeight: "300px", display: "grid", placeItems: "center", padding: `${t.pad}px` })}"><div style="${style({ ...cardStyle(t), maxWidth: "380px", textAlign: "center" })}">${icon(t)}<h2 style="${heading(24)}">No templates yet</h2><p style="${copy(t)}">Create your first reusable UI pattern and it will appear here.</p>${button("Create template", t, true)}</div></section>`;

    case "product-card":
      return `<article style="${style({ ...cardStyle(t), maxWidth: "360px", margin: "0 auto", overflow: "hidden", padding: 0 })}"><div style="${style({ height: "190px", background: `${t.primary}24` })}"></div><div style="${style({ padding: `${t.pad}px` })}"><h3 style="${heading(20)}">Everyday Backpack</h3><p style="${copy(t)}">Durable, light, and ready for daily carry.</p><div style="${style({ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px" })}"><strong style="${style({ fontSize: "24px" })}">$89</strong>${button("Add to cart", t, true)}</div></div></article>`;

    case "checkout-form":
      return `<form style="${style({ ...cardStyle(t), maxWidth: "680px", margin: "0 auto" })}"><h2 style="${heading(26)}">Checkout</h2><div style="${style({ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginTop: "18px" })}">${["Email", "First name", "Last name", "City"].map((field) => input(field, t)).join("")}</div><div style="${style({ marginTop: "16px" })}">${button("Complete order", t, true, true)}</div></form>`;

    case "mobile-bottom-navigation":
      return mobileShell(t, `<div style="${style({ ...cardStyle(t), padding: "14px" })}"><div style="${style({ height: "220px", background: t.subtle, borderRadius: "18px", padding: "16px" })}"><h2 style="${heading(24)}">Home</h2><p style="${copy(t)}">Mobile app content area.</p></div><nav style="${style({ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: t.subtle, borderRadius: "18px", padding: "8px", fontSize: "12px", textAlign: "center" })}">${["Home", "Search", "Saved", "Profile"].map((item, index) => `<span style="${style({ color: index === 0 ? t.primary : t.muted, padding: "10px 4px", fontWeight: index === 0 ? "700" : "500" })}">${item}</span>`).join("")}</nav></div>`);

    case "login-card":
      return `<section style="${style({ minHeight: "360px", display: "grid", placeItems: "center", padding: `${t.pad}px` })}"><div style="${style({ ...cardStyle(t), width: "100%", maxWidth: "380px", textAlign: "center" })}">${icon(t)}<h2 style="${heading(25)}">Welcome back</h2><p style="${copy(t)}">Sign in to continue to your workspace.</p><div style="${style({ display: "grid", gap: "10px", marginTop: "18px", textAlign: "left" })}">${input("Email", t)}${input("Password", t)}${button("Sign in", t, true, true)}</div></div></section>`;

    case "account-settings-panel":
    default:
      return section(t, `<aside style="${style({ color: t.muted, display: "grid", gap: "10px", alignContent: "start" })}"><strong style="${style({ color: t.primary })}">Profile</strong><span>Security</span><span>Notifications</span><span>Billing</span></aside><div style="${card(t)}"><h2 style="${heading(24)}">${escapeHtml(name)}</h2><p style="${copy(t)}">Manage profile, preferences, and notifications.</p><div style="${style({ display: "grid", gap: "12px", marginTop: "18px" })}">${input("Display name", t)}${input("Email", t)}${button("Save changes", t, true)}</div></div>`, "settings");
  }
}

function style(values: Record<string, string | number | undefined>): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`)
    .join(";");
}

function section(t: ReturnType<typeof previewTokens>, content: string, mode: "two" | "three" | "dashboard" | "settings" = "two"): string {
  const columns = mode === "three" ? "repeat(3, minmax(0, 1fr))" : mode === "dashboard" ? "180px 1fr" : mode === "settings" ? "160px 1fr" : "1fr 0.85fr";
  return `<section style="${style({ padding: `${t.pad}px`, display: "grid", gridTemplateColumns: columns, gap: `${t.gap}px`, alignItems: "center" })}">${content}</section>`;
}

function mobileShell(t: ReturnType<typeof previewTokens>, content: string): string {
  return `<section style="${style({ padding: `${t.pad}px`, minHeight: "520px" })}">${content}</section>`;
}

function cardStyle(t: ReturnType<typeof previewTokens>, accent = false): Record<string, string | number> {
  return {
    background: t.surface,
    border: `1px solid ${accent ? t.primary : t.border}`,
    borderRadius: `${t.radius}px`,
    padding: `${t.pad}px`,
    boxShadow: accent ? `0 18px 45px ${t.primary}22` : "0 12px 28px rgba(15, 23, 42, 0.08)"
  };
}

function card(t: ReturnType<typeof previewTokens>, accent = false): string {
  return style(cardStyle(t, accent));
}

function row(t: ReturnType<typeof previewTokens>): string {
  return style({ ...cardStyle(t), display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px" });
}

function heading(size: number): string {
  return style({ margin: "0 0 8px", fontSize: `${size}px`, lineHeight: 1.08, letterSpacing: 0, fontWeight: 800 });
}

function copy(t: ReturnType<typeof previewTokens>, size = 14): string {
  return style({ color: t.muted, margin: "0", fontSize: `${size}px`, lineHeight: 1.55 });
}

function button(label: string, t: ReturnType<typeof previewTokens>, primary: boolean, block = false): string {
  return `<button style="${style({ width: block ? "100%" : undefined, border: `1px solid ${primary ? t.primary : t.border}`, borderRadius: `${t.radius}px`, background: primary ? t.primary : t.surface, color: primary ? "#ffffff" : t.text, padding: "10px 14px", fontWeight: 700 })}">${escapeHtml(label)}</button>`;
}

function icon(t: ReturnType<typeof previewTokens>): string {
  const mark = t.icons ? "✓" : "";
  return `<div style="${style({ width: "44px", height: "44px", borderRadius: "14px", background: t.primary, color: "#ffffff", display: "grid", placeItems: "center", marginBottom: "12px", fontWeight: 800 })}">${mark}</div>`;
}

function pill(label: string, t: ReturnType<typeof previewTokens>): string {
  return `<span style="${style({ display: "inline-flex", width: "max-content", borderRadius: `${t.radius}px`, background: `${t.primary}18`, color: t.primary, padding: "6px 10px", fontSize: "12px", fontWeight: 700 })}">${escapeHtml(label)}</span>`;
}

function miniBlock(label: string, t: ReturnType<typeof previewTokens>): string {
  return `<div style="${style({ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "10px", fontSize: "12px", fontWeight: 700 })}">${escapeHtml(label)}</div>`;
}

function avatar(t: ReturnType<typeof previewTokens>): string {
  return style({ width: "64px", height: "64px", borderRadius: "999px", background: t.primary, display: "block" });
}

function input(label: string, t: ReturnType<typeof previewTokens>): string {
  return `<label style="${style({ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 650 })}">${escapeHtml(label)}<input style="${style({ width: "100%", border: `1px solid ${t.border}`, background: t.background, color: t.text, borderRadius: `${t.radius}px`, padding: "10px" })}" placeholder="${escapeHtml(label)}" /></label>`;
}
