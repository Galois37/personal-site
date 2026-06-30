const loginForm = document.querySelector("[data-login-form]");
const settingsForm = document.querySelector("[data-settings-form]");
const contentForm = document.querySelector("[data-content-form]");
const markdownForm = document.querySelector("[data-markdown-form]");
const markdownList = document.querySelector("[data-markdown-list]");
const markdownPreview = document.querySelector("[data-markdown-preview]");
const markdownSummary = document.querySelector("[data-markdown-summary]");
const markdownEditorButton = document.querySelector("[data-open-markdown-editor]");
const friendForm = document.querySelector("[data-friend-form]");
const momentForm = document.querySelector("[data-moment-form]");
const musicForm = document.querySelector("[data-music-form]");
const musicBulkForm = document.querySelector("[data-music-bulk-form]");
const musicNeteaseForm = document.querySelector("[data-music-netease-form]");
const musicNeteasePreview = document.querySelector("[data-music-netease-preview]");
const loginPanel = document.querySelector("[data-admin-login]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const adminList = document.querySelector("[data-admin-list]");
const commentsList = document.querySelector("[data-comments-list]");
const contentList = document.querySelector("[data-content-list]");
const friendsList = document.querySelector("[data-friends-list]");
const momentsList = document.querySelector("[data-moments-list]");
const musicList = document.querySelector("[data-music-list-admin]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminViews = document.querySelectorAll("[data-admin-view]");
const adminCurrentTitle = document.querySelector("[data-admin-current-title]");
const deployButton = document.querySelector("[data-deploy-button]");
const deployStatus = document.querySelector("[data-deploy-status]");

const tokenStoreKey = "galois37_admin_token";
const userTokenKey = "galois37_user_token";
const themeKey = "galois37_theme";
const articleEditorDraftKey = "galois37_article_editor_draft";

const defaultMusicPlaylist = [
  {
    id: "yoru-no-himawari",
    title: "夜の向日葵",
    artist: "松本文紀",
    cover: "assets/music/yoru-no-himawari-cover.jpg",
    src: "assets/music/yoru-no-himawari.mp3",
    note: "纯音乐 无歌词",
    lyrics: "",
    source: "local",
    sourceId: "",
    status: "visible"
  },
  {
    id: "natsu-no-daisankaku",
    title: "夏の大三角",
    artist: "ryo (supercell)",
    cover: "https://p1.music.126.net/3rtl6iK4Cue6mhE02ZNj2A==/109951166171557761.jpg",
    src: "assets/music/natsu-no-daisankaku.mp3",
    note: "纯音乐 无歌词",
    lyrics: "",
    source: "netease",
    sourceId: "4937375",
    status: "visible"
  }
];

const defaultSettings = {
  "site.name": "Galois37の完美算术教室",
  "site.onlineSince": "2026-06-02T00:00:00+08:00",
  "stats.baseVisitors": "0",
  "stats.baseViews": "0",
  "home.nickname": "Galois37",
  "home.subtitle": "欢迎来到Galois37の完美教室",
  "about.quote": "残酷な世界で咲く終焉の花",
  "about.bio": `你好，我是 Galois37~
nku 数院大一在读，也是成分复杂的地球 online 玩家。

数学品味与兴趣
• 调和分析与泛函分析：我说抽象分析是对的，PDE 算麻了(
• p 进数与数论：我的天呐数论 sama，你的每一个定理都是主人级别的哦齁齁齁。
• 分形：你见过无理数的维度吗？一起开始从测量海岸线到混沌系统的分形之旅吧！

数学之外呢
• 科幻与文学作品爱好者、meta 元素携带者、浅度二刺螈。
• 欲知更多？来查查成分重合度吧！

履历
主播没有什么光鲜亮丽的履历呜呜，只是一个想在地球 online 上刷点成就的普通人喵。

欢迎大家和我交流喵~`,
  "social.zhihu": "https://www.zhihu.com/people/riemann-85-53",
  "social.xhs": "https://xhslink.com/m/2OqSgZDfYsQ",
  "social.github": "https://github.com/Galois37",
  "social.qq": "2707752781",
  "social.email": "2707752781@qq.com",
  "rooms.notesTitle": "37的数学笔记",
  "rooms.articlesTitle": "数学之外のmeta",
  "rooms.askTitle": "提问箱与讨论区",
  "pages.notesDescription": "这里存放长期连载中的数学笔记。当前以 PDF 形式公开，后续可以逐步拆成网页专题。",
  "pages.articlesDescription": "这里放文章、杂谈、小程序和一些不太适合归进正式笔记里的东西。",
  "pages.askDescription": "无需登录即可提问，站长会筛选一部分问题公开。\n登录可开启私人回复功能，同时可以体验后续开发的一些玩法\n——那就，战个未来吧！",
  "pages.archiveDescription": "按时间收纳公开的笔记、项目、文章、资源和说说。",
  "pages.momentsDescription": "短动态、碎碎念、近况和一些不必写成文章的小记录。",
  "pages.friendsDescription": "存放朋友的网站、喜欢的个人站和想长期保留的网络角落。",
  "pages.musicDescription": "在这里播放和切换站点歌单。",
  "pages.matchDescription": "这个页面先作为功能预留。之后可以做成问卷、打分器，或者随机生成你和 Galois37 的兴趣契合度报告。",
  "music.playlist": JSON.stringify(defaultMusicPlaylist, null, 2),
};

let currentSettings = { ...defaultSettings };
let editingMarkdownId = null;

const adminViewTitles = {
  overview: "全息仪表盘",
  settings: "系统文案核心",
  content: "笔记与项目",
  markdown: "Markdown 文章",
  friends: "神经友链",
  moments: "说说发布台",
  music: "云端乐律",
  messages: "提问箱管理",
  comments: "评论区管理",
};

const contentCoverOverridesByTitle = {
  "从 p 进数到 Tate Thesis": "assets/content-covers/note-tate.jpg",
  "Analysis": "assets/content-covers/note-analysis.jpg",
  "数学 MBTI 测试": "assets/content-covers/project-math-mbti.jpg",
};

const replaceableContentCovers = new Set([
  "assets/room-notes.jpg",
  "assets/home-bg-2.jpg",
  "assets/home-bg-1.jpg",
  "assets/room-articles.jpg",
]);

function setStatus(form, text) {
  const status = form?.querySelector(".form-status");
  if (status) status.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function markdownToHtml(markdown) {
  const source = String(markdown || "").replace(/\r\n/g, "\n");
  if (!source.trim()) return `<p class="markdown-empty">预览会显示在这里。</p>`;

  const lines = source.split("\n");
  const html = [];
  let inCode = false;
  let codeLines = [];
  let listType = "";

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  const closeCode = () => {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
    inCode = false;
  };

  lines.forEach((line) => {
    if (/^\s*```/.test(line)) {
      if (inCode) {
        closeCode();
      } else {
        closeList();
        inCode = true;
        codeLines = [];
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = /^(#{1,4})\s*(.+)$/.exec(line);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const quote = /^>\s?(.+)$/.exec(line);
    if (quote) {
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      return;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${renderInlineMarkdown(unordered[1])}</li>`);
      return;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  if (inCode) closeCode();
  closeList();
  return html.join("");
}

function imageUrlWithVersion(url, version) {
  const normalized = String(url || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  const cacheKey = encodeURIComponent(String(version || Date.now()).replace(/\s+/g, "-"));
  return `${normalized}${normalized.includes("?") ? "&" : "?"}v=${cacheKey}`;
}

function defaultContentLabel(type) {
  if (type === "note") return "PDF";
  if (type === "article") return "Article";
  return "Program";
}

function defaultContentCover(type) {
  if (type === "note") return "assets/room-notes.jpg";
  if (type === "program") return "assets/room-articles.jpg";
  if (type === "article") return "assets/room-ask.jpg";
  return "assets/home-bg-2.jpg";
}

function looksLikeImagePath(value) {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(String(value || "").trim());
}

function normalizeImagePath(value) {
  return String(value || "").trim().replace(/\\/g, "/");
}

function splitContentLabel(raw, type) {
  const source = String(raw || "").trim();
  const parts = source.split("|").map((part) => part.trim()).filter(Boolean);
  const first = normalizeImagePath(parts[0] || "");
  const firstIsImage = looksLikeImagePath(first);
  return {
    label: firstIsImage ? defaultContentLabel(type) : (first || defaultContentLabel(type)),
    cover: normalizeImagePath(parts.length > 1 ? parts.slice(1).join("|") : (firstIsImage ? first : "")),
  };
}

function packContentLabel(label, cover, type) {
  const cleanLabel = String(label || "").trim() || defaultContentLabel(type);
  const cleanCover = String(cover || "").trim().replace(/\\/g, "/");
  return cleanCover ? `${cleanLabel}|${cleanCover}` : cleanLabel;
}

function contentCoverForAdmin(item) {
  const meta = splitContentLabel(item.label, item.type);
  const directCover = normalizeImagePath(item.image_url || item.cover_url || item.cover || "");
  const overrideCover = contentCoverOverridesByTitle[String(item.title || "").trim()] || "";
  const coverCanBeReplaced = !meta.cover || replaceableContentCovers.has(meta.cover);
  return directCover
    || (overrideCover && coverCanBeReplaced ? overrideCover : meta.cover)
    || overrideCover
    || defaultContentCover(item.type);
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", nextTheme === "light" ? "切换到黑夜模式" : "切换到白天模式");
    themeToggle.title = nextTheme === "light" ? "切换到黑夜模式" : "切换到白天模式";
  }
}

function initialTheme() {
  const saved = localStorage.getItem(themeKey);
  if (saved) return saved;
  return "dark";
}

applyTheme(initialTheme());

function setAdminView(name) {
  const hasView = [...adminViews].some((view) => view.dataset.adminView === name);
  const viewName = hasView ? name : "overview";
  if (adminCurrentTitle) adminCurrentTitle.textContent = adminViewTitles[viewName] || "站点管理";
  adminTabs.forEach((tab) => {
    const isActive = tab.dataset.adminTab === viewName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });
  adminViews.forEach((view) => {
    view.hidden = view.dataset.adminView !== viewName;
  });
  if (location.hash.slice(1) !== viewName) history.replaceState(null, "", `#${viewName}`);
}

async function api(path, options = {}) {
  const token = localStorage.getItem(tokenStoreKey) || localStorage.getItem(userTokenKey);
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

function fillSettingsForm(settings) {
  if (!settingsForm) return;
  const merged = { ...defaultSettings, ...settings };
  settingsForm.querySelectorAll("[name]").forEach((field) => {
    field.value = merged[field.name] || "";
  });
}

async function loadSettings() {
  const result = await api("/api/settings");
  currentSettings = { ...defaultSettings, ...(result.settings || {}) };
  fillSettingsForm(currentSettings);
  renderMusicItems(parseMusicPlaylist(currentSettings["music.playlist"]));
}

function parseMusicPlaylist(value) {
  let items = value;
  if (typeof value === "string") {
    try {
      items = JSON.parse(value);
    } catch {
      items = [];
    }
  }
  if (!Array.isArray(items)) items = [];
  const normalized = items
    .map((item, index) => ({
      id: String(item.id || `track-${Date.now()}-${index}`),
      title: String(item.title || "未命名音轨"),
      artist: String(item.artist || "未知作者"),
      cover: String(item.cover || "assets/avatar.jpg").replace(/\\/g, "/"),
      src: String(item.src || "").replace(/\\/g, "/"),
      note: String(item.note || ""),
      lyrics: String(item.lyrics || ""),
      source: String(item.source || "local"),
      sourceId: String(item.sourceId || item.neteaseId || ""),
      status: String(item.status || "visible"),
    }))
    .filter((item) => item.title !== "[object Object]");
  return normalized.length ? normalized : defaultMusicPlaylist;
}

function parseBulkMusicImport(value) {
  let parsed;

  if (Array.isArray(value)) {
    parsed = value;
  } else if (value && typeof value === "object") {
    parsed = value;
  } else {
    const source = String(value || "").trim();
    if (!source) return [];
    try {
      parsed = JSON.parse(source);
    } catch {
      if (source.includes("[object Object]")) return [];

      return source
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const parts = line.split("|").map((part) => part.trim());
          return {
            id: `track-${Date.now()}-${index}`,
            title: parts[0] || "未命名音轨",
            artist: parts[1] || "未知作者",
            src: (parts[2] || "").replace(/\\/g, "/"),
            cover: (parts[3] || "assets/avatar.jpg").replace(/\\/g, "/"),
            lyrics: parts[4] || "",
            note: parts[5] || "",
            source: parts[6] || "local",
            sourceId: parts[7] || "",
            status: "visible",
          };
        });
    }
  }

  if (typeof parsed === "string") {
    const source = parsed.trim();
    if (!source || source.includes("[object Object]")) return [];
    return source
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const parts = line.split("|").map((part) => part.trim());
        return {
          id: `track-${Date.now()}-${index}`,
          title: parts[0] || "未命名音轨",
          artist: parts[1] || "未知作者",
          src: (parts[2] || "").replace(/\\/g, "/"),
          cover: (parts[3] || "assets/avatar.jpg").replace(/\\/g, "/"),
          lyrics: parts[4] || "",
          note: parts[5] || "",
          source: parts[6] || "local",
          sourceId: parts[7] || "",
          status: "visible",
        };
      });
  }

  const items = Array.isArray(parsed) ? parsed : (parsed.tracks || parsed.songs || parsed.playlist || []);
  if (!Array.isArray(items) || !items.length) return [];
  return parseMusicPlaylist(items)
    .map((item, index) => ({
      ...item,
      id: item.id || `track-${Date.now()}-${index}`,
      status: item.status || "visible",
    }));
}

function renderNeteasePreview(data) {
  if (!musicNeteasePreview) return;
  const items = data.items || [];
  if (!items.length) {
    musicNeteasePreview.innerHTML = `<article class="glass-card admin-row"><strong>没有可预览的歌曲。</strong></article>`;
    return;
  }

  musicNeteasePreview.innerHTML = `
    <article class="glass-card admin-row">
      <div class="admin-row-head">
        <div>
          <strong>${escapeHtml(data.playlist?.name || "网易云导入")}</strong>
          <span class="admin-pill">${items.length} 首待导入</span>
        </div>
        <time>${escapeHtml(data.playlist?.id || "")}</time>
      </div>
      <p>${escapeHtml(data.warning || "音频路径需要后续自行补充。")}</p>
    </article>
    ${items.slice(0, 10).map((item) => `
      <article class="glass-card admin-row">
        <div class="admin-row-head">
          <div>
            <img class="admin-friend-avatar" src="${escapeHtml(item.cover || "assets/avatar.jpg")}" alt="" loading="lazy">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="admin-pill">${escapeHtml(item.artist)}</span>
            <span class="admin-pill">${item.lyrics ? "已带歌词" : "无歌词"}</span>
          </div>
          <time>${escapeHtml(item.sourceId)}</time>
        </div>
      </article>
    `).join("")}
  `;
}

function contentAdminPreview(item) {
  const meta = splitContentLabel(item.label, item.type);
  const cover = contentCoverForAdmin(item);
  const cleanUrl = String(item.url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `
    <div class="admin-content-preview">
      <img src="${escapeHtml(imageUrlWithVersion(cover, item.updated_at || item.id))}" alt="" loading="lazy">
      <div>
        <span class="admin-pill">${escapeHtml(meta.label || defaultContentLabel(item.type))}</span>
        <strong>${escapeHtml(item.title || "未命名内容")}</strong>
        <p>${escapeHtml(item.description || "还没有简介。")}</p>
        ${cleanUrl ? `<small>${escapeHtml(cleanUrl)}</small>` : ""}
      </div>
    </div>
  `;
}

async function saveMusicPlaylist(items) {
  currentSettings["music.playlist"] = JSON.stringify(items, null, 2);
  await api("/api/settings", {
    method: "POST",
    body: JSON.stringify({ settings: { "music.playlist": currentSettings["music.playlist"] } }),
  });
  renderMusicItems(items);
}

function renderMusicItems(items) {
  if (!musicList) return;
  if (!items.length) {
    musicList.innerHTML = `<article class="glass-card admin-row"><strong>暂无音乐</strong><p>可以先添加一首歌曲。</p></article>`;
    return;
  }

  musicList.innerHTML = items.map((item, index) => `
    <article class="glass-card admin-row music-edit-row" data-music-index="${index}">
      <div class="admin-row-head">
        <div>
          <img class="admin-friend-avatar" src="${escapeHtml(imageUrlWithVersion(item.cover || "assets/avatar.jpg", item.id))}" alt="" loading="lazy">
          <strong>${escapeHtml(item.title || "未命名音轨")}</strong>
          <span class="admin-pill">${escapeHtml(item.artist || "未知作者")}</span>
          <span class="admin-pill">${escapeHtml(item.status || "visible")}</span>
        </div>
        <time>#${index + 1}</time>
      </div>
      <label>歌曲标题<input type="text" name="title" value="${escapeHtml(item.title || "")}"></label>
      <label>作者 / 艺术家<input type="text" name="artist" value="${escapeHtml(item.artist || "")}"></label>
      <label>音频路径<input type="text" name="src" value="${escapeHtml(item.src || "")}" placeholder="assets/music/song.mp3 或 https://..."></label>
      <label>封面路径<input type="text" name="cover" value="${escapeHtml(item.cover || "")}" placeholder="assets/music/cover.jpg 或 https://..."></label>
      <label>备注 / 歌词提示<textarea name="note" rows="3" placeholder="纯音乐可以写：纯音乐 无歌词">${escapeHtml(item.note || "")}</textarea></label>
      <label>歌词<textarea name="lyrics" rows="7" placeholder="[00:00.00]第一句歌词&#10;[00:12.50]第二句歌词">${escapeHtml(item.lyrics || "")}</textarea></label>
      <label>来源<input type="text" name="source" value="${escapeHtml(item.source || "local")}" placeholder="local / netease / other"></label>
      <label>来源 ID<input type="text" name="sourceId" value="${escapeHtml(item.sourceId || "")}" placeholder="例如网易云歌曲 ID，可留空"></label>
      <label>
        状态
        <select name="status">
          <option value="visible">加入歌单</option>
          <option value="draft">暂不展示</option>
        </select>
      </label>
      <div class="admin-actions">
        <button class="button primary" type="button" data-save-music>保存音乐</button>
        <button class="button secondary" type="button" data-move-music="-1">上移</button>
        <button class="button secondary" type="button" data-move-music="1">下移</button>
        <button class="button danger" type="button" data-delete-music>删除音乐</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    </article>
  `).join("");

  musicList.querySelectorAll(".music-edit-row").forEach((row) => {
    const index = Number(row.dataset.musicIndex);
    const status = row.querySelector('[name="status"]');
    status.value = items[index]?.status || "visible";

    row.querySelector("[data-save-music]").addEventListener("click", async () => {
      const button = row.querySelector("[data-save-music]");
      const statusText = row.querySelector(".form-status");
      const nextItems = [...items];
      const updated = { ...nextItems[index] };
      row.querySelectorAll("[name]").forEach((field) => {
        updated[field.name] = field.value;
      });
      updated.src = updated.src.replace(/\\/g, "/");
      updated.cover = updated.cover.replace(/\\/g, "/");
      updated.source = updated.source || "local";
      updated.sourceId = updated.sourceId || "";
      nextItems[index] = updated;

      button.disabled = true;
      statusText.textContent = "正在保存...";
      try {
        await saveMusicPlaylist(nextItems);
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    row.querySelectorAll("[data-move-music]").forEach((button) => {
      button.addEventListener("click", async () => {
        const direction = Number(button.dataset.moveMusic);
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= items.length) return;
        const nextItems = [...items];
        [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
        await saveMusicPlaylist(nextItems);
      });
    });

    row.querySelector("[data-delete-music]").addEventListener("click", async () => {
      const title = items[index]?.title || "这首歌";
      if (!confirm(`确定删除「${title}」吗？`)) return;
      const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
      await saveMusicPlaylist(nextItems);
    });
  });
}

function renderContentItems(items) {
  if (!contentList) return;
  const contentItems = items.filter((item) => item.type !== "friend" && item.type !== "resource");
  if (!contentItems.length) {
    contentList.innerHTML = `<article class="glass-card admin-row"><strong>暂无内容条目</strong><p>可以先导入一条笔记或项目。</p></article>`;
    return;
  }

  contentList.innerHTML = contentItems.map((item) => {
    const meta = splitContentLabel(item.label, item.type);
    return `
    <article class="glass-card admin-row content-edit-row" data-content-id="${item.id}">
      <div class="admin-row-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="admin-pill">${escapeHtml(item.type)}</span>
          <span class="admin-pill">${escapeHtml(item.status)}</span>
        </div>
        <time>${escapeHtml(item.created_at || "")}</time>
      </div>
      ${contentAdminPreview(item)}
      <label>
        类型
        <select name="type">
          <option value="note">笔记 note</option>
          <option value="program">项目 program</option>
          <option value="article">文章 article</option>
        </select>
      </label>
      <label>标题<input type="text" name="title" value="${escapeHtml(item.title || "")}"></label>
      <label>说明<textarea name="description" rows="3">${escapeHtml(item.description || "")}</textarea></label>
      <label>链接<input type="url" name="url" value="${escapeHtml(item.url || "")}"></label>
      <label>标签<input type="text" name="label" value="${escapeHtml(meta.label || "")}" placeholder="PDF / Program / Article"></label>
      <label>名片配图<input type="text" name="cover" value="${escapeHtml(meta.cover || "")}" placeholder="assets/room-notes.jpg 或 https://..."></label>
      <label class="file-import-row">
        本地导入图片
        <input type="file" accept="image/*" data-cover-import>
        <span>选择后会自动填入上方配图字段。</span>
      </label>
      <label>
        状态
        <select name="status">
          <option value="visible">立即展示</option>
          <option value="draft">草稿，不展示</option>
        </select>
      </label>
      <div class="admin-actions">
        <button class="button primary" type="button" data-save-content>保存修改</button>
        <button class="button danger" type="button" data-delete-content>删除条目</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    </article>
  `;
  }).join("");

  contentList.querySelectorAll(".content-edit-row").forEach((row) => {
    const item = contentItems.find((entry) => String(entry.id) === row.dataset.contentId);
    row.querySelector('[name="type"]').value = item.type || "note";
    row.querySelector('[name="status"]').value = item.status || "visible";
    row.querySelector("[data-save-content]").addEventListener("click", async () => {
      const button = row.querySelector("[data-save-content]");
      const statusText = row.querySelector(".form-status");
      const payload = {};
      row.querySelectorAll("[name]").forEach((field) => {
        payload[field.name] = field.value;
      });
      payload.label = packContentLabel(payload.label, payload.cover, payload.type);
      delete payload.cover;

      button.disabled = true;
      statusText.textContent = "正在保存...";
      try {
        await api(`/api/content-items/${row.dataset.contentId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        statusText.textContent = "修改已保存。";
        await loadContentItems();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    row.querySelector("[data-delete-content]").addEventListener("click", async () => {
      const button = row.querySelector("[data-delete-content]");
      const statusText = row.querySelector(".form-status");
      const title = row.querySelector('[name="title"]').value || item.title || "这条内容";
      if (!confirm(`确定删除「${title}」吗？这个操作不能从控制台撤销。`)) return;

      button.disabled = true;
      statusText.textContent = "正在删除...";
      try {
        await api(`/api/content-items/${row.dataset.contentId}`, { method: "DELETE" });
        statusText.textContent = "已删除。";
        await loadContentItems();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  });
}

function friendAvatar(url, title, version) {
  if (url) {
    return `<img class="admin-friend-avatar" src="${escapeHtml(imageUrlWithVersion(url, version))}" alt="${escapeHtml(title || "友链头像")}" loading="lazy">`;
  }
  return `<span class="admin-friend-avatar admin-friend-placeholder">${escapeHtml((title || "友").slice(0, 1))}</span>`;
}

function friendAdminPreview(item) {
  const cleanUrl = String(item.url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `
    <div class="admin-friend-preview">
      ${friendAvatar(item.label, item.title, item.updated_at || item.id)}
      <div>
        <span><i></i> ONLINE</span>
        <strong>${escapeHtml(item.title || "未命名友链")}</strong>
        <p>${escapeHtml(item.description || "这个朋友还没有写简介。")}</p>
        ${cleanUrl ? `<small>${escapeHtml(cleanUrl)}</small>` : ""}
      </div>
    </div>
  `;
}

function renderFriendItems(items) {
  if (!friendsList) return;
  const friends = items.filter((item) => item.type === "friend");
  if (!friends.length) {
    friendsList.innerHTML = `<article class="glass-card admin-row"><strong>暂无友链</strong><p>可以先添加一个朋友的网站。</p></article>`;
    return;
  }

  friendsList.innerHTML = friends.map((item) => `
    <article class="glass-card admin-row friend-edit-row" data-content-id="${item.id}">
      <div class="admin-row-head">
        <div>
          ${friendAvatar(item.label, item.title, item.updated_at || item.id)}
          <strong>${escapeHtml(item.title || "")}</strong>
          <span class="admin-pill">${escapeHtml(item.status || "visible")}</span>
        </div>
        <time>${escapeHtml(item.created_at || "")}</time>
      </div>
      ${friendAdminPreview(item)}
      <label>站点名<input type="text" name="title" value="${escapeHtml(item.title || "")}"></label>
      <label>链接<input type="url" name="url" value="${escapeHtml(item.url || "")}"></label>
      <label>头像<input type="text" name="label" value="${escapeHtml(item.label || "")}"></label>
      <label>简介<textarea name="description" rows="3">${escapeHtml(item.description || "")}</textarea></label>
      <label>
        状态
        <select name="status">
          <option value="visible">立即展示</option>
          <option value="draft">草稿，不展示</option>
        </select>
      </label>
      <div class="admin-actions">
        <button class="button primary" type="button" data-save-friend>保存友链</button>
        <button class="button danger" type="button" data-delete-friend>删除友链</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    </article>
  `).join("");

  friendsList.querySelectorAll(".friend-edit-row").forEach((row) => {
    const item = friends.find((entry) => String(entry.id) === row.dataset.contentId);
    row.querySelector('[name="status"]').value = item.status || "visible";
    row.querySelector("[data-save-friend]").addEventListener("click", async () => {
      const button = row.querySelector("[data-save-friend]");
      const statusText = row.querySelector(".form-status");
      const payload = { type: "friend" };
      row.querySelectorAll("[name]").forEach((field) => {
        payload[field.name] = field.value;
      });

      button.disabled = true;
      statusText.textContent = "正在保存...";
      try {
        await api(`/api/content-items/${row.dataset.contentId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        statusText.textContent = "友链已保存。";
        await loadContentItems();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    row.querySelector("[data-delete-friend]").addEventListener("click", async () => {
      const button = row.querySelector("[data-delete-friend]");
      const statusText = row.querySelector(".form-status");
      const title = row.querySelector('[name="title"]').value || item.title || "这条友链";
      if (!confirm(`确定删除「${title}」吗？这个操作不能从控制台撤销。`)) return;

      button.disabled = true;
      statusText.textContent = "正在删除...";
      try {
        await api(`/api/content-items/${row.dataset.contentId}`, { method: "DELETE" });
        statusText.textContent = "已删除。";
        await loadContentItems();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function loadContentItems() {
  const result = await api("/api/content-items");
  const items = result.items || [];
  renderContentItems(items);
  renderFriendItems(items);
}

function markdownCoverFromItem(item) {
  const parts = String(item.label || "").split("|").map((part) => part.trim()).filter(Boolean);
  return item.cover || (parts.length > 1 ? parts.slice(1).join("|") : "");
}

function readArticleEditorDraft() {
  try {
    return JSON.parse(localStorage.getItem(articleEditorDraftKey) || "{}");
  } catch (error) {
    return {};
  }
}

function writeArticleEditorDraft(extra = {}) {
  if (!markdownForm) return;
  const draft = {
    id: editingMarkdownId || "",
    title: markdownForm.elements.title?.value || "",
    category: markdownForm.elements.category?.value || "Article",
    description: markdownForm.elements.description?.value || "",
    cover: markdownForm.elements.cover?.value || "",
    content: markdownForm.elements.content?.value || "",
    status: markdownForm.elements.status?.value || "draft",
    updatedAt: new Date().toISOString(),
    ...extra,
  };
  localStorage.setItem(articleEditorDraftKey, JSON.stringify(draft));
}

function restoreArticleEditorDraft() {
  if (!markdownForm) return;
  const draft = readArticleEditorDraft();
  if (!draft || Object.keys(draft).length === 0 || draft.consumed) return;
  editingMarkdownId = draft.id || editingMarkdownId;
  if (draft.title !== undefined) markdownForm.elements.title.value = draft.title || "";
  if (draft.category !== undefined) markdownForm.elements.category.value = draft.category || "Article";
  if (draft.description !== undefined) markdownForm.elements.description.value = draft.description || "";
  if (draft.cover !== undefined) markdownForm.elements.cover.value = draft.cover || "";
  if (draft.content !== undefined) markdownForm.elements.content.value = draft.content || "";
  if (draft.status !== undefined) markdownForm.elements.status.value = draft.status || "draft";
  updateMarkdownPreview();
  if (location.hash.slice(1) === "markdown") {
    setStatus(markdownForm, draft.content ? "正文已从编辑器带回。可以继续设置封面和状态。" : "");
  }
}

function markdownSummaryText(content) {
  const source = String(content || "").trim();
  if (!source) return "正文还没有开始写。";
  const lines = source.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const first = lines[0] || "";
  const count = source.length;
  return `${first.replace(/^#{1,6}\s*/, "").slice(0, 34)}${first.length > 34 ? "..." : ""} · ${count} 字符`;
}

function updateMarkdownPreview() {
  if (!markdownForm) return;
  const content = markdownForm.elements.content?.value || "";
  if (markdownPreview) markdownPreview.innerHTML = markdownToHtml(content);
  if (markdownSummary) markdownSummary.textContent = markdownSummaryText(content);
  writeArticleEditorDraft({ content });
}

function resetMarkdownForm() {
  if (!markdownForm) return;
  editingMarkdownId = null;
  markdownForm.reset();
  markdownForm.elements.category.value = "Article";
  markdownForm.elements.status.value = "draft";
  updateMarkdownPreview();
  localStorage.removeItem(articleEditorDraftKey);
  setStatus(markdownForm, "");
}

function fillMarkdownForm(item) {
  if (!markdownForm || !item) return;
  editingMarkdownId = item.id;
  markdownForm.elements.title.value = item.title || "";
  markdownForm.elements.category.value = item.category || "Article";
  markdownForm.elements.description.value = item.description || "";
  markdownForm.elements.cover.value = markdownCoverFromItem(item);
  markdownForm.elements.content.value = item.content || "";
  markdownForm.elements.status.value = item.status || "draft";
  writeArticleEditorDraft();
  updateMarkdownPreview();
  setAdminView("markdown");
  markdownForm.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(markdownForm, `正在编辑 #${item.id}`);
}

function renderMarkdownPosts(items) {
  if (!markdownList) return;
  if (!items.length) {
    markdownList.innerHTML = `<article class="glass-card admin-row"><strong>暂无 Markdown 文章</strong><p>可以在上方写第一篇 Article。</p></article>`;
    return;
  }

  markdownList.innerHTML = items.map((item) => {
    const cover = markdownCoverFromItem(item);
    const coverHtml = cover
      ? `<img class="admin-row-cover" src="${escapeHtml(imageUrlWithVersion(cover, item.updated_at || item.id))}" alt="" loading="lazy">`
      : `<span class="admin-row-cover admin-row-cover-empty">MD</span>`;
    return `
      <article class="glass-card admin-row markdown-edit-row" data-post-id="${item.id}">
        <div class="admin-row-head">
          <div class="admin-row-titleline">
            ${coverHtml}
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <span class="admin-pill">${escapeHtml(item.category || "Article")}</span>
              <span class="admin-pill">${escapeHtml(item.status || "draft")}</span>
            </div>
          </div>
          <time>${escapeHtml(item.updated_at || item.created_at || "")}</time>
        </div>
        <p>${escapeHtml(item.description || "还没有写卡片描述。")}</p>
        <div class="admin-actions">
          <a class="button secondary" href="article.html?id=${encodeURIComponent(item.id)}" target="_blank" rel="noreferrer">预览文章</a>
          <button class="button primary" type="button" data-edit-markdown>继续编辑</button>
          <button class="button danger" type="button" data-delete-markdown>删除文章</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </div>
      </article>
    `;
  }).join("");

  markdownList.querySelectorAll(".markdown-edit-row").forEach((row) => {
    const id = row.dataset.postId;
    const statusText = row.querySelector(".form-status");
    row.querySelector("[data-edit-markdown]")?.addEventListener("click", async () => {
      statusText.textContent = "正在读取文章...";
      try {
        const result = await api(`/api/posts/${id}`);
        fillMarkdownForm(result.item);
        statusText.textContent = "";
      } catch (error) {
        statusText.textContent = error.message;
      }
    });

    row.querySelector("[data-delete-markdown]")?.addEventListener("click", async () => {
      const title = row.querySelector("strong")?.textContent || "这篇文章";
        if (!confirm(`确定删除「${title}」吗？文章目录中的记录也会一起删除。`)) return;
      statusText.textContent = "正在删除...";
      try {
        await api(`/api/posts/${id}`, { method: "DELETE" });
        statusText.textContent = "已删除。";
        if (String(editingMarkdownId) === String(id)) resetMarkdownForm();
        await Promise.all([loadMarkdownPosts(), loadContentItems()]);
      } catch (error) {
        statusText.textContent = error.message;
      }
    });
  });
}

async function loadMarkdownPosts() {
  if (!markdownList) return;
  const result = await api("/api/posts");
  renderMarkdownPosts(result.items || []);
}

function splitImageUrls(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function momentPreviewImages(value, alt) {
  const urls = splitImageUrls(value);
  if (!urls.length) return "";
  return `<div class="admin-moment-gallery">${urls.map((url, index) => (
    `<img class="admin-moment-image" src="${escapeHtml(url)}" alt="${escapeHtml(`${alt || "说说配图"} ${index + 1}`)}" loading="lazy">`
  )).join("")}</div>`;
}

function momentAdminPreview(item) {
  const author = item.author_name || "Galois37的猫猫";
  const background = item.background_url ? ` style="--moment-bg: url('${escapeHtml(item.background_url)}')"` : "";
  return `
    <div class="admin-moment-preview"${background}>
      <div class="admin-moment-preview-head">
        <img class="admin-friend-avatar" src="assets/avatar.jpg" alt="" loading="lazy">
        <div>
          <strong>${escapeHtml(author)}</strong>
          <time>${escapeHtml(String(item.created_at || "").slice(0, 16).replace("T", " "))}</time>
        </div>
      </div>
      <p>${escapeHtml(item.content || "还没有正文。")}</p>
      ${momentPreviewImages(item.image_url, item.content)}
    </div>
  `;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("图片读取失败")));
    reader.readAsDataURL(file);
  });
}

async function handleCoverImport(input) {
  const file = input.files?.[0];
  if (!file) return;
  const container = input.closest(".content-edit-row") || input.closest("form");
  const statusText = container?.querySelector(".form-status");
  const coverInput = container?.querySelector('input[name="cover"]');
  if (!coverInput) return;
  if (!file.type.startsWith("image/")) {
    if (statusText) statusText.textContent = "请选择图片文件。";
    return;
  }
  if (statusText) statusText.textContent = "正在读取本地图片...";
  try {
    const dataUrl = await readFileAsDataUrl(file);
    coverInput.value = dataUrl;
    const previewImage = container?.querySelector(".admin-content-preview img");
    if (previewImage) previewImage.src = dataUrl;
    if (statusText) statusText.textContent = "图片已导入配图字段，保存后生效。";
  } catch (error) {
    if (statusText) statusText.textContent = error.message || "图片读取失败。";
  } finally {
    input.value = "";
  }
}

function renderMomentItems(items) {
  if (!momentsList) return;
  if (!items.length) {
    momentsList.innerHTML = `<article class="glass-card admin-row"><strong>暂无说说</strong><p>可以先发布一条动态。</p></article>`;
    return;
  }

  momentsList.innerHTML = items.map((item) => `
    <article class="glass-card admin-row moment-edit-row" data-moment-id="${item.id}">
      <div class="admin-row-head">
        <div>
          <strong>${escapeHtml(item.author_name || "Galois37的猫猫")}</strong>
          <span class="admin-pill">${escapeHtml(item.status || "visible")}</span>
        </div>
        <time>${escapeHtml(item.created_at || "")}</time>
      </div>
      ${momentAdminPreview(item)}
      <label>
        发布身份
        <select name="authorName">
          <option value="Galois37的猫猫">Galois37的猫猫</option>
          <option value="Galois37">Galois37</option>
        </select>
      </label>
      <label>想说的话<textarea name="content" rows="4">${escapeHtml(item.content || "")}</textarea></label>
      <label>插入图片<textarea name="imageUrl" rows="4" placeholder="每行一张图片路径或链接">${escapeHtml(item.image_url || "")}</textarea></label>
      <label>名片背景图<input type="text" name="backgroundUrl" value="${escapeHtml(item.background_url || "")}"></label>
      <label>
        状态
        <select name="status">
          <option value="visible">立即展示</option>
          <option value="draft">草稿，不展示</option>
        </select>
      </label>
      <div class="admin-actions">
        <button class="button primary" type="button" data-save-moment>保存说说</button>
        <button class="button danger" type="button" data-delete-moment>删除说说</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    </article>
  `).join("");

  momentsList.querySelectorAll(".moment-edit-row").forEach((row) => {
    const item = items.find((entry) => String(entry.id) === row.dataset.momentId);
    row.querySelector('[name="authorName"]').value = item.author_name || "Galois37的猫猫";
    row.querySelector('[name="status"]').value = item.status || "visible";
    row.querySelector("[data-save-moment]").addEventListener("click", async () => {
      const button = row.querySelector("[data-save-moment]");
      const statusText = row.querySelector(".form-status");
      const payload = {};
      row.querySelectorAll("[name]").forEach((field) => {
        payload[field.name] = field.value;
      });

      button.disabled = true;
      statusText.textContent = "正在保存...";
      try {
        await api(`/api/moments/${row.dataset.momentId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        statusText.textContent = "说说已保存。";
        await loadMoments();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    row.querySelector("[data-delete-moment]").addEventListener("click", async () => {
      const button = row.querySelector("[data-delete-moment]");
      const statusText = row.querySelector(".form-status");
      if (!confirm("确定删除这条说说吗？这个操作不能从控制台撤销。")) return;

      button.disabled = true;
      statusText.textContent = "正在删除...";
      try {
        await api(`/api/moments/${row.dataset.momentId}`, { method: "DELETE" });
        statusText.textContent = "已删除。";
        await loadMoments();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function loadMoments() {
  const result = await api("/api/moments");
  renderMomentItems(result.items || []);
}

async function loadDashboard() {
  const [stats, messages, comments] = await Promise.all([
    api("/api/stats"),
    api("/api/messages"),
    api("/api/comments"),
  ]);

  document.querySelector("[data-stat-views]").textContent = `${stats.totalViews || 0} views`;
  document.querySelector("[data-stat-messages]").textContent = `${messages.items?.length || 0} messages`;
  document.querySelector("[data-stat-comments]").textContent = `${comments.items?.length || 0} comments`;

  const messageItems = messages.items || [];
  const commentItems = comments.items || [];

  adminList.innerHTML = "";
  if (!messageItems.length) {
    adminList.innerHTML = `<article class="glass-card admin-row"><strong>暂无提问</strong><p>有人提交提问后会出现在这里。</p></article>`;
  }
  messageItems.forEach((item) => {
    const row = document.createElement("article");
    row.className = "glass-card admin-row message-admin-row";
    row.innerHTML = `
      <div class="admin-row-head">
        <div>
          <strong>${escapeHtml(item.name || "匿名")}</strong>
          <span class="admin-pill">${escapeHtml(item.status || "pending")}</span>
          <span class="admin-pill">${item.user_id ? `账号：${escapeHtml(item.username || item.display_name || item.user_id)}` : "匿名提问"}</span>
        </div>
        <time>${escapeHtml(item.created_at || "")}</time>
      </div>
      <p class="question-text">${escapeHtml(item.message || "")}</p>
      <label>
        我的回答
        <textarea name="answer" rows="4" placeholder="写下回复后，可以选择是否公开展示。">${escapeHtml(item.answer || "")}</textarea>
      </label>
      <label>
        展示状态
        <select name="status">
          <option value="pending">待处理，暂不展示</option>
          <option value="private">只显示给提问者</option>
          <option value="public">公开展示</option>
        </select>
      </label>
      <div class="admin-actions">
        <button class="button primary" type="button">保存回答</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    `;
    row.querySelector("select").value = item.status || "pending";
    row.querySelector("button").addEventListener("click", async () => {
      const button = row.querySelector("button");
      const statusText = row.querySelector(".form-status");
      const payload = {
        answer: row.querySelector("textarea").value,
        status: row.querySelector("select").value,
      };

      button.disabled = true;
      statusText.textContent = "正在保存...";
      try {
        await api(`/api/messages/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        statusText.textContent = payload.status === "public" ? "已保存，并会在公开问答展示。" : "已保存。";
        await loadDashboard();
      } catch (error) {
        statusText.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    adminList.append(row);
  });

  if (commentsList) {
    commentsList.innerHTML = "";
    if (!commentItems.length) {
      commentsList.innerHTML = `<article class="glass-card admin-row"><strong>暂无评论</strong><p>讨论区评论会在后续功能开放后出现在这里。</p></article>`;
    }
  }
  commentItems.forEach((item) => {
    const row = document.createElement("article");
    row.className = "glass-card admin-row";
    row.innerHTML = `<strong>${escapeHtml(item.name || "匿名")}</strong><p>${escapeHtml(item.content || "")}</p><button class="button secondary" type="button">删除评论</button>`;
    row.querySelector("button").addEventListener("click", async () => {
      await api(`/api/comments/${item.id}`, { method: "DELETE" });
      await loadDashboard();
    });
    commentsList?.append(row);
  });
}

async function loadAdminData() {
  await Promise.all([
    loadDashboard(),
    loadSettings(),
    loadContentItems(),
    loadMarkdownPosts(),
    loadMoments(),
  ]);
  restoreArticleEditorDraft();
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem(themeKey, nextTheme);
  applyTheme(nextTheme);
});

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => setAdminView(tab.dataset.adminTab));
});

setAdminView(location.hash.slice(1));

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");

  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    localStorage.setItem(tokenStoreKey, result.token);
    loginPanel.hidden = true;
    dashboard.hidden = false;
    await loadAdminData();
  } catch (error) {
    setStatus(loginForm, error.message);
  }
});

settingsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const settings = Object.fromEntries(new FormData(settingsForm).entries());

  try {
    await api("/api/settings", { method: "POST", body: JSON.stringify({ settings }) });
    setStatus(settingsForm, "文案已保存，刷新前台页面即可看到。");
  } catch (error) {
    setStatus(settingsForm, error.message);
  }
});

contentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(contentForm).entries());
  payload.label = packContentLabel(payload.label, payload.cover, payload.type);
  delete payload.cover;

  try {
    await api("/api/content-items", { method: "POST", body: JSON.stringify(payload) });
    setStatus(contentForm, "内容条目已保存。");
    contentForm.reset();
    await loadContentItems();
  } catch (error) {
    setStatus(contentForm, error.message);
  }
});

markdownForm?.addEventListener("input", updateMarkdownPreview);

markdownEditorButton?.addEventListener("click", () => {
  writeArticleEditorDraft();
  window.location.href = "article-editor.html";
});

markdownForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(markdownForm).entries());
  const button = markdownForm.querySelector('button[type="submit"]');
  const method = editingMarkdownId ? "PATCH" : "POST";
  const path = editingMarkdownId ? `/api/posts/${editingMarkdownId}` : "/api/posts";

  if (button) button.disabled = true;
  setStatus(markdownForm, "正在保存文章...");
  try {
    const result = await api(path, { method, body: JSON.stringify(payload) });
    editingMarkdownId = result.id || editingMarkdownId;
    writeArticleEditorDraft({ id: editingMarkdownId });
    setStatus(markdownForm, "文章已保存，文章目录已同步。");
    await Promise.all([loadMarkdownPosts(), loadContentItems()]);
  } catch (error) {
    setStatus(markdownForm, error.message);
  } finally {
    if (button) button.disabled = false;
  }
});

document.querySelector("[data-markdown-new]")?.addEventListener("click", resetMarkdownForm);

document.addEventListener("change", (event) => {
  if (event.target?.matches?.("[data-cover-import], [data-markdown-cover-import]")) {
    handleCoverImport(event.target);
  }
});

deployButton?.addEventListener("click", async () => {
  deployButton.disabled = true;
  if (deployStatus) deployStatus.textContent = "正在触发 GitHub Actions 部署...";
  try {
    const result = await api("/api/deploy", { method: "POST", body: JSON.stringify({}) });
    if (deployStatus) {
      deployStatus.innerHTML = `已触发部署。<a href="${escapeHtml(result.actionsUrl)}" target="_blank" rel="noreferrer">查看 Actions</a>`;
    }
  } catch (error) {
    if (deployStatus) deployStatus.textContent = error.message;
  } finally {
    deployButton.disabled = false;
  }
});

friendForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { type: "friend", ...Object.fromEntries(new FormData(friendForm).entries()) };

  try {
    await api("/api/content-items", { method: "POST", body: JSON.stringify(payload) });
    setStatus(friendForm, "友链已添加。");
    friendForm.reset();
    await loadContentItems();
  } catch (error) {
    setStatus(friendForm, error.message);
  }
});

momentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(momentForm).entries());

  try {
    await api("/api/moments", { method: "POST", body: JSON.stringify(payload) });
    setStatus(momentForm, "说说已发布。");
    momentForm.reset();
    await loadMoments();
  } catch (error) {
    setStatus(momentForm, error.message);
  }
});

musicForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(musicForm).entries());
  const items = parseMusicPlaylist(currentSettings["music.playlist"]);
  const nextItem = {
    id: `track-${Date.now()}`,
    title: payload.title || "未命名音轨",
    artist: payload.artist || "未知作者",
    src: String(payload.src || "").replace(/\\/g, "/"),
    cover: String(payload.cover || "assets/avatar.jpg").replace(/\\/g, "/"),
    note: payload.note || "",
    lyrics: payload.lyrics || "",
    source: payload.source || "local",
    sourceId: payload.sourceId || "",
    status: payload.status || "visible",
  };

  if (!nextItem.src.trim()) {
    setStatus(musicForm, "请填写音频路径。");
    return;
  }

  try {
    await saveMusicPlaylist([...items, nextItem]);
    setStatus(musicForm, "音乐已加入歌单。");
    musicForm.reset();
  } catch (error) {
    setStatus(musicForm, error.message);
  }
});

musicBulkForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(musicBulkForm);
  const imported = parseBulkMusicImport(formData.get("playlist"));
  if (!imported.length) {
    setStatus(musicBulkForm, "没有识别到可导入的歌曲。");
    return;
  }

  const mode = formData.get("mode") || "append";
  const currentItems = parseMusicPlaylist(currentSettings["music.playlist"]);
  const nextItems = mode === "replace" ? imported : [...currentItems, ...imported];

  try {
    await saveMusicPlaylist(nextItems);
    setStatus(musicBulkForm, `已导入 ${imported.length} 首歌曲。`);
    musicBulkForm.reset();
  } catch (error) {
    setStatus(musicBulkForm, error.message);
  }
});

musicNeteaseForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(musicNeteaseForm);
  const playlist = String(formData.get("playlist") || "").trim();
  const limit = String(formData.get("limit") || "50").trim();
  const includeLyrics = formData.get("lyrics") === "on";
  const mode = formData.get("mode") || "append";
  const button = musicNeteaseForm.querySelector('button[type="submit"]');

  if (!playlist) {
    setStatus(musicNeteaseForm, "请填写网易云歌单/单曲链接或 ID。");
    return;
  }

  if (button) button.disabled = true;
  setStatus(musicNeteaseForm, "正在读取网易云歌单/单曲...");
  try {
    const data = await api(`/api/music/netease?playlist=${encodeURIComponent(playlist)}&limit=${encodeURIComponent(limit)}&lyrics=${includeLyrics ? "1" : "0"}`);
    const imported = parseBulkMusicImport(data.items || []);
    if (!imported.length) throw new Error("没有可导入的歌曲。");
    const currentItems = parseMusicPlaylist(currentSettings["music.playlist"]);
    const nextItems = mode === "replace" ? imported : [...currentItems, ...imported];
    await saveMusicPlaylist(nextItems);
    renderNeteasePreview({ ...data, items: imported });
    setStatus(musicNeteaseForm, `已导入 ${imported.length} 首草稿歌曲。请补充 mp3 路径后再设为加入歌单。`);
  } catch (error) {
    setStatus(musicNeteaseForm, error.message);
    if (musicNeteasePreview) {
      musicNeteasePreview.innerHTML = `<article class="glass-card admin-row"><strong>导入失败</strong><p>${escapeHtml(error.message)}</p></article>`;
    }
  } finally {
    if (button) button.disabled = false;
  }
});

if (localStorage.getItem(tokenStoreKey) || localStorage.getItem(userTokenKey)) {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  loadAdminData().catch(() => {
    localStorage.removeItem(tokenStoreKey);
    loginPanel.hidden = false;
    dashboard.hidden = true;
  });
}
