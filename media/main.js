(function () {
  const vscode = acquireVsCodeApi();
  const app = document.getElementById("app");
  let state;
  let search = "";
  let browsed = false;

  vscode.postMessage({ type: "ready" });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "state") {
      state = event.data.state;
      render();
    }
  });

  function render() {
    if (!state) {
      return;
    }

    const filtered = getFilteredTemplates();
    const favoriteTemplates = state.templates.filter((template) => state.favorites.includes(template.id));
    const recentTemplates = state.recents.map((id) => state.templates.find((template) => template.id === id)).filter(Boolean);
    const showWelcome = !browsed && state.recents.length === 0 && search.length === 0;

    app.innerHTML = `
      ${showWelcome ? welcomeMarkup() : ""}
      <section class="toolbar" aria-label="Template filters">
        <input class="search" id="search" placeholder="Search templates" value="${escapeHtml(search)}" />
        <div class="segmented" role="list" aria-label="Platform filter">
          ${platformButton("all", "All")}
          ${platformButton("web", "Web")}
          ${platformButton("mobile", "Mobile")}
          ${platformButton("cross-platform", "Cross platform")}
        </div>
        <div class="chips" aria-label="Categories">
          ${state.categories.map((category) => chip(category)).join("")}
        </div>
      </section>
      ${favoriteTemplates.length ? templateSection("Favorites", favoriteTemplates.slice(0, 4)) : ""}
      ${recentTemplates.length ? templateSection("Recent", recentTemplates.slice(0, 4)) : ""}
      ${templateSection("Templates", filtered)}
      ${selectedMarkup()}
      <div id="toast" aria-live="polite"></div>
    `;

    bindEvents();
  }

  function welcomeMarkup() {
    return `<section class="welcome">
      <h1>Welcome to UICrafter.</h1>
      <p>Choose a template, preview it, customize it, then insert it into your project.</p>
      <button id="browse">Browse templates</button>
    </section>`;
  }

  function templateSection(label, templates) {
    if (!templates.length) {
      return `<section><div class="section-label">${label}</div><div class="empty-state"><p>No templates match this filter.</p></div></section>`;
    }

    return `<section>
      <div class="section-label"><span>${escapeHtml(label)}</span><span>${templates.length}</span></div>
      <div class="template-list">
        ${templates.map(templateCard).join("")}
      </div>
    </section>`;
  }

  function templateCard(template) {
    const isSelected = template.id === state.selectedTemplateId;
    const isFavorite = state.favorites.includes(template.id);
    return `<button class="template-card ${isSelected ? "is-selected" : ""}" data-template-id="${template.id}">
      <div class="template-card__top">
        <div>
          <strong>${escapeHtml(template.name)}</strong>
          <p>${escapeHtml(template.description)}</p>
        </div>
        <span class="star" title="${isFavorite ? "Remove favorite" : "Add favorite"}" data-favorite-id="${template.id}">${isFavorite ? "★" : "☆"}</span>
      </div>
      <div class="tags">
        <span class="tag">${escapeHtml(platformLabel(template.platform))}</span>
        ${template.supportedTargets.map((target) => `<span class="tag">${escapeHtml(shortTarget(target))}</span>`).join("")}
      </div>
    </button>`;
  }

  function selectedMarkup() {
    const template = state.selectedTemplate;
    const config = state.config;
    return `<section class="selected">
      <div>
        <h2>${escapeHtml(template.name)}</h2>
        <p>${escapeHtml(template.description)}</p>
      </div>
      <div class="field">
        <label for="target">Output target</label>
        <select id="target">
          ${template.supportedTargets.map((target) => `<option value="${target}" ${target === state.target ? "selected" : ""}>${escapeHtml(state.outputTargetLabels[target])}</option>`).join("")}
        </select>
      </div>
      <div class="control-grid">
        ${selectField("theme", "Theme", ["light", "dark"], config.theme)}
        ${selectField("style", "Style", ["minimal", "modern", "premium", "playful"], config.style)}
        ${selectField("radius", "Radius", ["none", "sm", "md", "lg", "xl", "2xl"], config.radius)}
        ${selectField("density", "Density", ["compact", "comfortable", "spacious"], config.density)}
        ${selectField("font", "Font", ["system", "inter", "poppins"], config.font)}
        ${selectField("variant", "Variant", template.variants.map((variant) => variant.id), config.variant)}
      </div>
      <div class="field">
        <label for="primaryColor">Primary color</label>
        <input id="primaryColor" type="color" value="${escapeHtml(config.primaryColor)}" />
      </div>
      <label class="check-row"><input id="includeIcons" type="checkbox" ${config.includeIcons ? "checked" : ""} /> Include icons</label>
      <label class="check-row"><input id="includeSampleData" type="checkbox" ${config.includeSampleData ? "checked" : ""} /> Include sample data</label>
      <div class="preview-card">
        <div class="preview-card__header"><strong>Preview</strong><button id="openPreview">Open full preview</button></div>
        <div class="preview-card__content">${state.previewHtml}</div>
      </div>
      <div class="actions">
        <button data-action="insert" class="primary">Insert</button>
        <button data-action="replace">Replace</button>
        <button data-action="create">Create file</button>
        <button data-action="copy">Copy</button>
      </div>
      <details>
        <summary>Generated code</summary>
        <pre class="code-preview"><code>${escapeHtml(state.generatedCode)}</code></pre>
      </details>
    </section>`;
  }

  function selectField(id, label, options, selected) {
    return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-config-key="${id}">${options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(labelize(option))}</option>`).join("")}</select></div>`;
  }

  function chip(category) {
    const active = state.lastCategory === category;
    return `<button class="${active ? "is-active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
  }

  function platformButton(filter, label) {
    return `<button class="${state.lastPlatformFilter === filter ? "is-active" : ""}" data-platform="${filter}">${label}</button>`;
  }

  function bindEvents() {
    document.getElementById("browse")?.addEventListener("click", () => {
      browsed = true;
      render();
      document.getElementById("search")?.focus();
    });

    document.getElementById("search")?.addEventListener("input", (event) => {
      search = event.target.value;
      render();
      document.getElementById("search")?.focus();
    });

    document.querySelectorAll("[data-platform]").forEach((button) => {
      button.addEventListener("click", () => vscode.postMessage({ type: "setPlatformFilter", platformFilter: button.dataset.platform }));
    });

    document.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => vscode.postMessage({ type: "setCategory", category: button.dataset.category }));
    });

    document.querySelectorAll("[data-template-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target?.dataset?.favoriteId) {
          return;
        }
        vscode.postMessage({ type: "selectTemplate", templateId: button.dataset.templateId });
      });
    });

    document.querySelectorAll("[data-favorite-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        vscode.postMessage({ type: "toggleFavorite", templateId: button.dataset.favoriteId });
      });
    });

    document.getElementById("target")?.addEventListener("change", (event) => {
      vscode.postMessage({ type: "setTarget", target: event.target.value });
    });

    document.querySelectorAll("[data-config-key]").forEach((input) => {
      input.addEventListener("change", (event) => {
        vscode.postMessage({ type: "updateConfig", config: { [event.target.dataset.configKey]: event.target.value } });
      });
    });

    document.getElementById("primaryColor")?.addEventListener("input", (event) => {
      vscode.postMessage({ type: "updateConfig", config: { primaryColor: event.target.value } });
    });

    document.getElementById("includeIcons")?.addEventListener("change", (event) => {
      vscode.postMessage({ type: "updateConfig", config: { includeIcons: event.target.checked } });
    });

    document.getElementById("includeSampleData")?.addEventListener("change", (event) => {
      vscode.postMessage({ type: "updateConfig", config: { includeSampleData: event.target.checked } });
    });

    document.getElementById("openPreview")?.addEventListener("click", () => {
      vscode.postMessage({ type: "action", action: "openPreview" });
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        showToast(`${button.textContent.trim()} requested`);
        vscode.postMessage({ type: "action", action: button.dataset.action });
      });
    });
  }

  function getFilteredTemplates() {
    const query = search.trim().toLowerCase();
    return state.templates.filter((template) => {
      const matchesSearch = !query || [template.name, template.description, template.category, template.platform, ...template.tags].join(" ").toLowerCase().includes(query);
      const matchesCategory = state.lastCategory === "All" || template.category === state.lastCategory;
      const matchesPlatform = state.lastPlatformFilter === "all" || template.platform === state.lastPlatformFilter;
      return matchesSearch && matchesCategory && matchesPlatform;
    });
  }

  function platformLabel(platform) {
    return platform === "cross-platform" ? "Cross platform" : labelize(platform);
  }

  function shortTarget(target) {
    if (target === "react-tailwind") return "React";
    if (target === "html-css") return "HTML";
    return labelize(target);
  }

  function labelize(value) {
    return String(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
    window.setTimeout(() => {
      toast.innerHTML = "";
    }, 1600);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
