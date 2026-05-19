# UICrafter

UICrafter is a VS Code extension for generating, previewing, customizing, and inserting reusable UI designs directly into code projects.

It is built as an extension first. The Activity Bar opens a UICrafter sidebar where you can browse templates, preview them, adjust simple design controls, generate code, and insert or create files without running a server or signing in.

## Features

- UICrafter Activity Bar icon and sidebar view
- Shared template registry for web, mobile, and cross-platform UI patterns
- Live sidebar preview and larger full preview panel
- Search, categories, favorites, recent templates, and platform filtering
- Simple controls for theme, style, primary color, radius, density, font, variant, icons, and sample data
- Output targets for React with Tailwind, HTML and CSS, and Flutter
- Insert at cursor, replace selection, copy generated code, and create component file actions
- Local persistence for favorites, recents, last target, config, category, and platform filter
- Basic framework detection for React, Next.js, Flutter, and plain HTML projects

## How It Works

UICrafter uses one universal template layer. Each template describes the UI pattern in a platform-neutral way:

- Template identity, category, tags, and platform type
- Supported output targets
- Layout intent
- Content schema
- Theme, spacing, radius, preview data, and variants

Platform-specific generators then turn the selected template and config into code for a target:

- `react-tailwind`
- `html-css`
- `flutter`

Future targets can be added without splitting the template system into separate web and mobile tools.

## Run Locally

```bash
npm install
npm run compile
```

Then open this folder in VS Code and run **Run UICrafter Extension** from the Run and Debug panel. VS Code will launch an Extension Development Host with UICrafter available in the Activity Bar.

## Use In VS Code

1. Click the UICrafter icon in the Activity Bar.
2. Browse or search templates.
3. Filter by All, Web, Mobile, or Cross platform.
4. Select a template.
5. Choose a supported output target.
6. Adjust controls and watch the preview update.
7. Copy code, insert at cursor, replace selected code, or create a component file.

If no editor or workspace is open, UICrafter shows a clear VS Code error message for actions that need one.

## Universal Templates

Templates live in `src/templates`. The registry combines web, mobile, and cross-platform templates into one list. A single template can support multiple targets when it makes sense.

For example:

- Login card: React with Tailwind, HTML and CSS, Flutter
- Responsive navbar: React with Tailwind, HTML and CSS
- Mobile bottom navigation: React with Tailwind, Flutter

The output target selector only shows targets declared by the selected template.

## Add Templates

Add a template in `src/templates/webTemplates.ts` or `src/templates/mobileTemplates.ts`, then include:

- `id`
- `name`
- `description`
- `category`
- `platform`
- `tags`
- `supportedTargets`
- `layoutIntent`
- `variants`
- `defaultConfig`

Preview rendering is handled by `src/templates/preview.ts`. Add a new preview case when the template needs a custom visual.

## Add Code Generators

Generators live in `src/generators`.

To adjust existing output:

- React with Tailwind: `src/generators/reactTailwind.ts`
- HTML and CSS: `src/generators/htmlCss.ts`
- Flutter: `src/generators/flutter.ts`

Generated code should stay readable, paste-ready, dependency-light, and consistent.

## Add New Output Targets

1. Add the target to `OutputTarget` in `src/templates/types.ts`.
2. Add a label in `outputTargetLabels`.
3. Create a generator in `src/generators`.
4. Add routing in `generateForTarget` in `src/templates/registry.ts`.
5. Add the new target to templates that support it.
6. Add file creation behavior in `src/services/codeActions.ts` if it needs a new extension or marker style.

## Roadmap

- React Native export
- SwiftUI export
- Jetpack Compose export
- Vue export
- Svelte export
- Drag and drop layout editing
- Prompt to UI generation
- Screenshot to UI generation
- Project design system detection
- Component replacement using AST parsing
- Live project preview
- Custom saved templates
- Marketplace packaging
- Standalone web app using the same core template engine
