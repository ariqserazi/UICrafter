import type { GenerateFunction } from "./types";

export const generateHtmlCss: GenerateFunction = ({ template, config }) => {
  const pageTitle = template.name;
  const preview = template.previewHtml(config);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <style>
      :root {
        color-scheme: ${config.theme};
        --uic-primary: ${config.primaryColor};
        --uic-bg: ${config.theme === "dark" ? "#09090b" : "#ffffff"};
        --uic-surface: ${config.theme === "dark" ? "#18181b" : "#ffffff"};
        --uic-text: ${config.theme === "dark" ? "#fafafa" : "#18181b"};
        --uic-muted: ${config.theme === "dark" ? "#a1a1aa" : "#52525b"};
        --uic-border: ${config.theme === "dark" ? "#27272a" : "#e4e4e7"};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: ${config.font === "system" ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" : config.font === "inter" ? "Inter, system-ui, sans-serif" : "Poppins, system-ui, sans-serif"};
        background: var(--uic-bg);
        color: var(--uic-text);
      }

      button,
      input {
        font: inherit;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .uicrafter-preview {
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <main class="uicrafter-preview">
${preview
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
    </main>
  </body>
</html>
`;
};
