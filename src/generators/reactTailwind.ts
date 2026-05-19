import type { GenerateFunction } from "./types";
import { toPascalCase } from "../utils/stringUtils";

const densityPadding = {
  compact: "p-4",
  comfortable: "p-6",
  spacious: "p-8"
};

const densityGap = {
  compact: "gap-3",
  comfortable: "gap-5",
  spacious: "gap-7"
};

const radiusClass = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl"
};

function shell(theme: string): string {
  return theme === "dark"
    ? "bg-zinc-950 text-zinc-50"
    : "bg-white text-zinc-950";
}

function muted(theme: string): string {
  return theme === "dark" ? "text-zinc-400" : "text-zinc-600";
}

function panel(theme: string): string {
  return theme === "dark"
    ? "border-zinc-800 bg-zinc-900/80"
    : "border-zinc-200 bg-white";
}

function iconSvg(): string {
  return `<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5L10 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>`;
}

export const generateReactTailwind: GenerateFunction = ({ template, config }) => {
  const componentName = toPascalCase(template.name);
  const code = renderTemplate(template.id, config);

  return `export default function ${componentName}() {
  return (
${indent(code, 4)}
  );
}
`;
};

function indent(value: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line.trim().length > 0 ? `${prefix}${line}` : line))
    .join("\n");
}

function renderTemplate(templateId: string, config: Parameters<GenerateFunction>[0]["config"]): string {
  const accent = config.primaryColor;
  const radius = radiusClass[config.radius];
  const padding = densityPadding[config.density];
  const gap = densityGap[config.density];
  const base = shell(config.theme);
  const softText = muted(config.theme);
  const card = panel(config.theme);
  const icon = config.includeIcons ? iconSvg() : "";

  switch (templateId) {
    case "saas-hero-section":
      return `<section className="${base} ${padding} overflow-hidden">
  <div className="mx-auto grid max-w-6xl items-center ${gap} py-12 md:grid-cols-[1.05fr_0.95fr]">
    <div className="space-y-6">
      <span className="inline-flex ${radius} px-3 py-1 text-sm font-medium" style={{ backgroundColor: "${accent}18", color: "${accent}" }}>
        Launch faster with UICrafter
      </span>
      <div className="space-y-4">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">Ship polished interfaces without starting from zero.</h1>
        <p className="${softText} max-w-xl text-lg">Generate clean, reusable UI blocks for product pages, dashboards, forms, and mobile screens.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="${radius} px-5 py-3 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: "${accent}" }}>Start crafting</button>
        <button className="${radius} border px-5 py-3 text-sm font-semibold ${card}">View templates</button>
      </div>
    </div>
    <div className="${radius} border ${card} p-4 shadow-xl">
      <div className="${radius} border border-dashed border-current/15 p-5">
        <div className="mb-4 h-3 w-28 rounded-full" style={{ backgroundColor: "${accent}" }} />
        <div className="grid gap-3 sm:grid-cols-2">
          {["Hero", "Pricing", "Dashboard", "Mobile"].map((item) => (
            <div key={item} className="${radius} border border-current/10 p-4">
              <div className="mb-8 h-16 rounded-lg bg-current/5" />
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>`;

    case "login-card":
      return `<section className="${base} grid min-h-[520px] place-items-center ${padding}">
  <div className="w-full max-w-md ${radius} border ${card} p-6 shadow-sm">
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl text-white" style={{ backgroundColor: "${accent}" }}>${config.includeIcons ? icon : ""}</div>
      <h2 className="text-2xl font-bold">Welcome back</h2>
      <p className="${softText} mt-1 text-sm">Sign in to continue to your workspace.</p>
    </div>
    <div className="space-y-4">
      <label className="block text-sm font-medium">Email<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2 outline-none focus:ring-2" placeholder="you@example.com" /></label>
      <label className="block text-sm font-medium">Password<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2 outline-none focus:ring-2" type="password" placeholder="••••••••" /></label>
      <button className="w-full ${radius} px-4 py-2.5 font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Sign in</button>
    </div>
  </div>
</section>`;

    case "pricing-section":
      return `<section className="${base} ${padding}">
  <div className="mx-auto max-w-6xl space-y-8">
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold tracking-tight">Simple pricing for growing teams</h2>
      <p className="${softText} mt-2">Choose a plan that fits the way your team ships interfaces.</p>
    </div>
    <div className="grid ${gap} md:grid-cols-3">
      {["Starter", "Pro", "Scale"].map((plan, index) => (
        <article key={plan} className="${radius} border ${card} p-6 shadow-sm">
          <p className="text-sm font-semibold" style={{ color: index === 1 ? "${accent}" : undefined }}>{plan}</p>
          <div className="mt-4 flex items-end gap-1"><span className="text-4xl font-bold">$ {index === 0 ? 19 : index === 1 ? 49 : 99}</span><span className="${softText} mb-1">/mo</span></div>
          <ul className="mt-6 space-y-3 text-sm">
            {["Reusable templates", "Live preview", "Paste-ready code"].map((feature) => <li key={feature} className="flex gap-2">${config.includeIcons ? icon : ""}<span>{feature}</span></li>)}
          </ul>
          <button className="mt-6 w-full ${radius} px-4 py-2.5 font-semibold" style={{ backgroundColor: index === 1 ? "${accent}" : "transparent", color: index === 1 ? "white" : "inherit", border: "1px solid currentColor" }}>Choose {plan}</button>
        </article>
      ))}
    </div>
  </div>
</section>`;

    case "responsive-navbar":
      return `<nav className="${base} border-b border-current/10 px-4 py-3">
  <div className="mx-auto flex max-w-6xl items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 ${radius}" style={{ backgroundColor: "${accent}" }} />
      <span className="font-bold">UICrafter</span>
    </div>
    <div className="hidden items-center gap-6 text-sm ${softText} md:flex">
      <a href="#">Templates</a><a href="#">Preview</a><a href="#">Export</a><a href="#">Docs</a>
    </div>
    <button className="${radius} px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Get started</button>
  </div>
</nav>`;

    case "feature-card-grid":
      return `<section className="${base} ${padding}">
  <div className="mx-auto max-w-6xl">
    <div className="mb-8 max-w-2xl">
      <h2 className="text-3xl font-bold">Everything your UI workflow needs</h2>
      <p className="${softText} mt-2">A compact toolkit for turning common product patterns into clean code.</p>
    </div>
    <div className="grid ${gap} md:grid-cols-3">
      {["Preview instantly", "Customize safely", "Export clean code", "Favorite patterns", "Create files", "Stay native"].map((feature) => (
        <div key={feature} className="${radius} border ${card} p-5">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg text-white" style={{ backgroundColor: "${accent}" }}>${config.includeIcons ? icon : ""}</div>
          <h3 className="font-semibold">{feature}</h3>
          <p className="${softText} mt-2 text-sm">Use a focused control surface that keeps decisions simple and output readable.</p>
        </div>
      ))}
    </div>
  </div>
</section>`;

    case "analytics-dashboard-layout":
      return `<section className="${base} ${padding}">
  <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[220px_1fr]">
    <aside className="${radius} border ${card} p-4">
      <h2 className="font-bold">Dashboard</h2>
      <div className="mt-5 space-y-2 text-sm ${softText}"><p>Overview</p><p>Traffic</p><p>Revenue</p><p>Settings</p></div>
    </aside>
    <main className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {["Revenue", "Users", "Conversion"].map((metric, index) => (
          <div key={metric} className="${radius} border ${card} p-5"><p className="${softText} text-sm">{metric}</p><p className="mt-2 text-2xl font-bold">{index === 0 ? "$48.2k" : index === 1 ? "12.8k" : "8.4%"}</p></div>
        ))}
      </div>
      <div className="${radius} border ${card} p-5">
        <div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">Weekly activity</h3><span className="${softText} text-sm">Live</span></div>
        <div className="flex h-48 items-end gap-3">
          {[42, 68, 54, 88, 72, 95, 81].map((height) => <div key={height} className="flex-1 rounded-t-lg" style={{ height: \`\${height}%\`, backgroundColor: "${accent}" }} />)}
        </div>
      </div>
    </main>
  </div>
</section>`;

    case "mobile-profile-screen":
      return `<section className="${base} mx-auto max-w-sm ${padding}">
  <div className="${radius} border ${card} p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full" style={{ backgroundColor: "${accent}" }} />
      <div><h2 className="text-xl font-bold">Alex Morgan</h2><p className="${softText} text-sm">Product designer</p></div>
    </div>
    <div className="my-6 grid grid-cols-3 gap-3 text-center">
      {["24", "1.8k", "128"].map((value) => <div key={value} className="rounded-xl bg-current/5 p-3"><p className="font-bold">{value}</p><p className="${softText} text-xs">Stats</p></div>)}
    </div>
    <button className="w-full ${radius} py-3 font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Follow</button>
  </div>
</section>`;

    case "mobile-settings-screen":
      return `<section className="${base} mx-auto max-w-sm ${padding}">
  <div className="${radius} border ${card} p-5">
    <h2 className="text-xl font-bold">Settings</h2>
    <div className="mt-5 space-y-3">
      {["Notifications", "Privacy", "Appearance", "Billing"].map((item, index) => (
        <div key={item} className="flex items-center justify-between rounded-xl bg-current/5 p-4">
          <span>{item}</span><span className="${softText}">{index === 0 ? "On" : "›"}</span>
        </div>
      ))}
    </div>
  </div>
</section>`;

    case "portfolio-project-grid":
      return `<section className="${base} ${padding}">
  <div className="mx-auto max-w-6xl">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div><h2 className="text-3xl font-bold">Selected work</h2><p className="${softText} mt-2">A clean grid for case studies and launches.</p></div>
      <button className="${radius} border ${card} px-4 py-2 text-sm font-semibold">View all</button>
    </div>
    <div className="grid ${gap} md:grid-cols-3">
      {["Studio OS", "Atlas App", "Nova Store"].map((project) => (
        <article key={project} className="${radius} overflow-hidden border ${card}">
          <div className="h-44" style={{ backgroundColor: "${accent}22" }} />
          <div className="p-5"><h3 className="font-semibold">{project}</h3><p className="${softText} mt-2 text-sm">Brand, product, and interface design.</p></div>
        </article>
      ))}
    </div>
  </div>
</section>`;

    case "empty-state-card":
      return `<section className="${base} grid min-h-[360px] place-items-center ${padding}">
  <div className="max-w-md text-center ${radius} border ${card} p-8">
    <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ backgroundColor: "${accent}" }}>${config.includeIcons ? icon : ""}</div>
    <h2 className="text-2xl font-bold">No templates yet</h2>
    <p className="${softText} mt-2">Create your first reusable UI pattern and it will appear here.</p>
    <button className="mt-6 ${radius} px-5 py-2.5 font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Create template</button>
  </div>
</section>`;

    case "product-card":
      return `<article className="${base} max-w-sm ${radius} overflow-hidden border ${card} shadow-sm">
  <div className="h-56" style={{ backgroundColor: "${accent}24" }} />
  <div className="space-y-4 p-5">
    <div><h3 className="text-lg font-bold">Everyday Backpack</h3><p className="${softText} text-sm">Durable, light, and ready for daily carry.</p></div>
    <div className="flex items-center justify-between"><span className="text-2xl font-bold">$89</span><button className="${radius} px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Add to cart</button></div>
  </div>
</article>`;

    case "checkout-form":
      return `<section className="${base} ${padding}">
  <form className="mx-auto max-w-2xl ${radius} border ${card} p-6">
    <h2 className="text-2xl font-bold">Checkout</h2>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {["Email", "First name", "Last name", "City"].map((field) => <label key={field} className="text-sm font-medium">{field}<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2" /></label>)}
      <label className="text-sm font-medium md:col-span-2">Address<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2" /></label>
    </div>
    <button className="mt-6 w-full ${radius} px-4 py-3 font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Complete order</button>
  </form>
</section>`;

    case "mobile-bottom-navigation":
      return `<section className="${base} mx-auto max-w-sm ${padding}">
  <div className="${radius} border ${card} p-4">
    <div className="mb-5 h-64 rounded-2xl bg-current/5 p-4"><h2 className="text-xl font-bold">Home</h2><p className="${softText} mt-2 text-sm">Mobile app content area.</p></div>
    <nav className="grid grid-cols-4 rounded-2xl bg-current/5 p-2 text-center text-xs">
      {["Home", "Search", "Saved", "Profile"].map((item, index) => <button key={item} className="rounded-xl px-2 py-3 font-medium" style={{ color: index === 0 ? "${accent}" : "inherit" }}>{item}</button>)}
    </nav>
  </div>
</section>`;

    case "account-settings-panel":
    default:
      return `<section className="${base} ${padding}">
  <div className="mx-auto max-w-4xl ${radius} border ${card} p-6">
    <div className="mb-6"><h2 className="text-2xl font-bold">Account settings</h2><p className="${softText} mt-1">Manage profile, preferences, and notifications.</p></div>
    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
      <div className="space-y-2 text-sm ${softText}"><p className="font-semibold" style={{ color: "${accent}" }}>Profile</p><p>Security</p><p>Notifications</p><p>Billing</p></div>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Display name<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2" defaultValue="Alex Morgan" /></label>
        <label className="block text-sm font-medium">Email<input className="mt-2 w-full ${radius} border border-current/15 bg-transparent px-3 py-2" defaultValue="alex@example.com" /></label>
        <button className="${radius} px-4 py-2.5 font-semibold text-white" style={{ backgroundColor: "${accent}" }}>Save changes</button>
      </div>
    </div>
  </div>
</section>`;
  }
}
