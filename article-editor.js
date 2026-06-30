(function () {
  const draftKey = "galois37_article_editor_draft";
  const themeKey = "galois37_theme";
  const input = document.querySelector("[data-editor-input]");
  const preview = document.querySelector("[data-editor-preview]");
  const doneButton = document.querySelector("[data-editor-done]");
  const backButton = document.querySelector("[data-editor-back]");
  const titleLabel = document.querySelector("[data-editor-title]");
  const countLabel = document.querySelector("[data-editor-count]");

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function flushParagraph(buffer, html) {
    if (!buffer.length) return;
    html.push(`<p>${buffer.map(inlineMarkdown).join("<br>")}</p>`);
    buffer.length = 0;
  }

  function markdownToHtml(markdown) {
    const source = String(markdown || "").replace(/\r\n/g, "\n");
    if (!source.trim()) return `<p class="markdown-empty">预览会显示在这里。</p>`;

    const lines = source.split("\n");
    const html = [];
    const paragraph = [];
    let inCode = false;
    let inMath = false;
    let code = [];
    let math = [];
    let mathClose = "\\]";
    let list = null;

    function closeList() {
      if (!list) return;
      html.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
      list = null;
    }

    lines.forEach((line) => {
      if (/^```/.test(line.trim())) {
        if (inCode) {
          html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
          code = [];
          inCode = false;
        } else {
          flushParagraph(paragraph, html);
          closeList();
          inCode = true;
        }
        return;
      }

      if (inMath) {
        if (line.trim() === mathClose) {
          html.push(`<div class="math-block">${mathClose === "$$" ? "$$" : "\\["}${escapeHtml(math.join("\n"))}${mathClose}</div>`);
          math = [];
          inMath = false;
        } else {
          math.push(line);
        }
        return;
      }

      if (inCode) {
        code.push(line);
        return;
      }

      if (!line.trim()) {
        flushParagraph(paragraph, html);
        closeList();
        return;
      }

      if (line.trim() === "\\[" || line.trim() === "$$") {
        flushParagraph(paragraph, html);
        closeList();
        inMath = true;
        mathClose = line.trim() === "$$" ? "$$" : "\\]";
        math = [];
        return;
      }

      const heading = /^(#{1,4})\s*(.+)$/.exec(line);
      if (heading) {
        flushParagraph(paragraph, html);
        closeList();
        const level = heading[1].length;
        html.push(`<h${level}>${inlineMarkdown(heading[2].trim())}</h${level}>`);
        return;
      }

      const quote = /^>\s?(.*)$/.exec(line);
      if (quote) {
        flushParagraph(paragraph, html);
        closeList();
        html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
        return;
      }

      const unordered = /^[-*]\s+(.+)$/.exec(line);
      const ordered = /^\d+\.\s+(.+)$/.exec(line);
      if (unordered || ordered) {
        flushParagraph(paragraph, html);
        const type = unordered ? "ul" : "ol";
        if (!list || list.type !== type) closeList();
        if (!list) list = { type, items: [] };
        list.items.push((unordered || ordered)[1]);
        return;
      }

      closeList();
      paragraph.push(line);
    });

    flushParagraph(paragraph, html);
    closeList();
    if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    if (inMath) html.push(`<div class="math-block">${mathClose === "$$" ? "$$" : "\\["}${escapeHtml(math.join("\n"))}${mathClose}</div>`);
    return html.join("\n");
  }

  function typesetMath(container, attempts = 0) {
    if (!container || !window.MathJax) return;
    if (!window.MathJax.typesetPromise && !window.MathJax.typeset && attempts < 30) {
      window.setTimeout(() => typesetMath(container, attempts + 1), 150);
      return;
    }
    const run = () => {
      if (window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([container]).catch(() => {});
      } else if (window.MathJax.typeset) {
        window.MathJax.typeset([container]);
      }
    };
    if (window.MathJax.startup?.promise) window.MathJax.startup.promise.then(run);
    else run();
  }

  function readDraft() {
    try {
      return JSON.parse(localStorage.getItem(draftKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function writeDraft(extra = {}) {
    const draft = {
      ...readDraft(),
      content: input?.value || "",
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    return draft;
  }

  function render() {
    const content = input?.value || "";
    if (preview) {
      preview.innerHTML = markdownToHtml(content);
      typesetMath(preview);
    }
    if (countLabel) countLabel.textContent = `${content.trim().length} 字符`;
    writeDraft();
  }

  function goBack() {
    writeDraft();
    window.location.href = "admin.html#markdown";
  }

  applyTheme(localStorage.getItem(themeKey) || "dark");

  const draft = readDraft();
  if (titleLabel) titleLabel.textContent = draft.title || "未命名文章";
  if (input) {
    input.value = draft.content || "";
    input.addEventListener("input", render);
  }
  doneButton?.addEventListener("click", goBack);
  backButton?.addEventListener("click", goBack);
  render();
})();
