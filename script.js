const userTokenKey = "galois37_user_token";
const themeKey = "galois37_theme";

let currentUser = null;
const ownerDisplayName = "Galois37的猫猫";
let navToggle;
let siteNav;
let themeToggle;
let musicPlayerRoots;
let musicListBoard;
let musicLyricBoard;
let musicSearchInput;
let musicPanelTabs;
let musicPanelViews;
let messageForm;
let publicMessages;
let privateMessages;
let archiveBoard;
let momentsBoard;
let friendsBoard;
let privateSection;
let userForm;
let authModeButtons;
let registerOnly;
let authNote;
let authSubmit;
let guestPanel;
let userPanel;
let currentUserText;
let logoutButton;
let pageAbortController;
let cachedSettings = {};

function refreshDomRefs() {
  navToggle = document.querySelector(".nav-toggle");
  siteNav = document.querySelector(".site-nav");
  themeToggle = document.querySelector("[data-theme-toggle]");
  musicPlayerRoots = document.querySelectorAll("[data-music-player]");
  musicListBoard = document.querySelector("[data-music-list]");
  musicLyricBoard = document.querySelector("[data-music-lyrics]");
  musicSearchInput = document.querySelector("[data-music-search]");
  musicPanelTabs = document.querySelectorAll("[data-music-panel-tab]");
  musicPanelViews = document.querySelectorAll("[data-music-panel]");
  messageForm = document.querySelector("[data-message-form], [data-static-form]");
  publicMessages = document.querySelector("[data-public-messages]");
  privateMessages = document.querySelector("[data-private-messages]");
  archiveBoard = document.querySelector("[data-archive-board]");
  momentsBoard = document.querySelector("[data-moments-board]");
  friendsBoard = document.querySelector("[data-friends-board]");
  privateSection = document.querySelector("[data-private-section]");
  userForm = document.querySelector("[data-user-form]");
  authModeButtons = document.querySelectorAll("[data-auth-mode-button]");
  registerOnly = document.querySelector("[data-register-only]");
  authNote = document.querySelector("[data-auth-note]");
  authSubmit = document.querySelector("[data-auth-submit]");
  guestPanel = document.querySelector("[data-guest-panel]");
  userPanel = document.querySelector("[data-user-panel]");
  currentUserText = document.querySelector("[data-current-user]");
  logoutButton = document.querySelector("[data-logout]");
}

function addPageListener(target, eventName, handler) {
  target?.addEventListener(eventName, handler, { signal: pageAbortController?.signal });
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 2400) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const result = await response.json().catch(() => ({}));
    return { response, result };
  } finally {
    window.clearTimeout(timer);
  }
}

refreshDomRefs();

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

const defaultContentItems = [
  {
    id: "static-note-tate",
    type: "note",
    title: "从 p 进数到 Tate Thesis",
    description: "长期连载中的数学笔记。",
    url: "assets/notes/p-adic-to-tate-thesis.pdf",
    label: "PDF|assets/content-covers/note-tate.jpg",
    status: "visible",
    created_at: "2026-06-02 15:49:42",
    updated_at: "2026-06-05-pdf-deploy-1",
  },
  {
    id: "static-note-analysis",
    type: "note",
    title: "Analysis",
    description: "长期连载中的分析笔记。",
    url: "assets/notes/analysis.pdf",
    label: "PDF|assets/content-covers/note-analysis.jpg",
    status: "visible",
    created_at: "2026-06-02 15:49:44",
    updated_at: "2026-06-05-pdf-deploy-1",
  },
  {
    id: "static-math-mbti",
    type: "program",
    title: "数学 MBTI 测试",
    description: "一个用于测试数学人格类型的小项目。",
    url: "https://galois37.github.io/math.mbti-test/",
    label: "Program|assets/content-covers/project-math-mbti.jpg",
    status: "visible",
    created_at: "2026-06-02 15:49:46",
    updated_at: "2026-06-02",
  },
];

let runtimeConfig = {
  onlineSince: new Date(defaultSettings["site.onlineSince"]).getTime(),
  baseVisitors: Number(defaultSettings["stats.baseVisitors"]) || 0,
  baseViews: Number(defaultSettings["stats.baseViews"]) || 0,
};
let activeMusicPlaylist = defaultMusicPlaylist;
let currentMusicIndex = 0;
let currentMusicSearch = "";
let musicControllers = [];
let activeLyricIndex = -1;
let shouldContinueMusic = false;
let demoToneUrl = "";
const globalMusicAudio = new Audio();
globalMusicAudio.preload = "metadata";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function imageUrlWithVersion(url, version) {
  const normalized = String(url || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  const cacheKey = encodeURIComponent(String(version || Date.now()).replace(/\s+/g, "-"));
  return `${normalized}${normalized.includes("?") ? "&" : "?"}v=${cacheKey}`;
}

function assetUrlWithVersion(url, version) {
  const normalized = String(url || "").trim().replace(/\\/g, "/");
  if (!normalized || normalized === "#") return normalized || "#";
  if (/^(https?:|mailto:|tencent:)/i.test(normalized)) return normalized;
  return imageUrlWithVersion(normalized, version);
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

function parseContentMeta(item) {
  const raw = String(item.label || "").trim();
  const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
  const first = normalizeImagePath(parts[0] || "");
  const packedCover = normalizeImagePath(parts.length > 1 ? parts.slice(1).join("|") : "");
  const directCover = normalizeImagePath(item.image_url || item.cover_url || item.cover || "");
  const firstIsImage = looksLikeImagePath(first);
  const label = firstIsImage ? "" : first;
  const overrideCover = contentCoverOverridesByTitle[String(item.title || "").trim()] || "";
  const packedCanBeReplaced = !packedCover || replaceableContentCovers.has(packedCover);
  const cover = directCover
    || (overrideCover && packedCanBeReplaced ? overrideCover : packedCover)
    || (firstIsImage ? first : "")
    || overrideCover
    || defaultContentCover(item.type);
  return {
    label: label || (item.type === "note" ? "PDF" : item.type === "article" ? "Article" : "Program"),
    cover,
  };
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto -9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
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
updateRuntimeClock();
setInterval(updateRuntimeClock, 1000);

function formatQaDate(value) {
  if (!value) return "";
  const raw = String(value);
  const datePart = raw.slice(0, 10).replace(/-/g, ".");
  const timePart = raw.includes("T") ? raw.slice(11, 16) : raw.slice(11, 16);
  return timePart ? `${datePart} ${timePart}` : datePart;
}

function renderMessages(target, items, emptyTitle, emptyText) {
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `
      <article class="qa-item qa-empty">
        <strong>${escapeHtml(emptyTitle)}</strong>
        <p>${escapeHtml(emptyText)}</p>
      </article>
    `;
    return;
  }

  target.innerHTML = items.map((item) => {
    const askedAt = formatQaDate(item.created_at);
    return `
      <article class="qa-item">
        <div class="qa-question">
          <div class="qa-line">
            <strong>${escapeHtml(item.name || "匿名用户")} ${ownerBadge(item.role)}提问</strong>
            ${askedAt ? `<time class="qa-meta" datetime="${escapeHtml(item.created_at || "")}">${escapeHtml(askedAt)}</time>` : ""}
          </div>
          <p>${escapeHtml(item.message || "")}</p>
        </div>
        <div class="qa-answer">
          <strong>${ownerDisplayName} ${ownerBadge("owner")}回答</strong>
          <p>${escapeHtml(item.answer || "")}</p>
        </div>
      </article>
    `;
  }).join("");
}

function ownerBadge(role) {
  return role === "owner" ? `<span class="owner-badge" title="站长认证">站长认证</span> ` : "";
}

function setAuthMode(mode) {
  const nextMode = mode === "register" ? "register" : "login";
  if (userForm) userForm.dataset.authMode = nextMode;
  authModeButtons.forEach((button) => {
    const isActive = button.dataset.authModeButton === nextMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (registerOnly) {
    registerOnly.hidden = nextMode !== "register";
    const displayNameInput = registerOnly.querySelector("input");
    if (displayNameInput) displayNameInput.required = nextMode === "register";
  }
  const passwordInput = userForm?.querySelector('[name="password"]');
  if (passwordInput) passwordInput.autocomplete = nextMode === "register" ? "new-password" : "current-password";
  if (authSubmit) authSubmit.textContent = nextMode === "register" ? "注册" : "登录";
  if (authNote) {
    authNote.textContent = nextMode === "register"
      ? "注册需要填写账号、昵称和密码。"
      : "登录只需要填写账号和密码；注册时再填写昵称。";
  }
}

function setText(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

function setHref(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach((node) => {
    node.href = value;
  });
}

function numberSetting(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function configureRuntime(data) {
  const onlineSince = new Date(data["site.onlineSince"] || defaultSettings["site.onlineSince"]).getTime();
  runtimeConfig = {
    onlineSince: Number.isFinite(onlineSince) ? onlineSince : new Date(defaultSettings["site.onlineSince"]).getTime(),
    baseVisitors: numberSetting(data["stats.baseVisitors"], 0),
    baseViews: numberSetting(data["stats.baseViews"], 0),
  };
  updateRuntimeClock();
}

function parseLyrics(value) {
  const source = String(value || "").replace(/\r\n/g, "\n").trim();
  if (!source) return [];

  const timedLines = [];
  const timeTagPattern = /\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  source.split("\n").forEach((line) => {
    const matches = [...line.matchAll(timeTagPattern)];
    const text = line.replace(timeTagPattern, "").trim();
    if (!matches.length) return;

    matches.forEach((match) => {
      const hours = Number(match[1] || 0);
      const minutes = Number(match[2] || 0);
      const seconds = Number(match[3] || 0);
      const fraction = match[4] ? Number(`0.${match[4].padEnd(3, "0").slice(0, 3)}`) : 0;
      const time = (hours * 3600) + (minutes * 60) + seconds + fraction;
      if (Number.isFinite(time) && text) timedLines.push({ time, text });
    });
  });

  if (timedLines.length) {
    return timedLines.sort((a, b) => a.time - b.time);
  }

  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ time: null, text }));
}

function splitLyricText(value) {
  const [primary, ...secondaryParts] = String(value || "").split(/\s+\/\s+/);
  return {
    primary: (primary || "").trim(),
    secondary: secondaryParts.join(" / ").trim(),
  };
}

function lyricPreviewText(value) {
  const lyric = splitLyricText(value);
  return [lyric.primary, lyric.secondary].filter(Boolean).join("\n");
}

function normalizeMusicPlaylist(value) {
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
      id: String(item.id || `track-${index + 1}`),
      title: String(item.title || "未命名音轨").trim(),
      artist: String(item.artist || "未知作者").trim(),
      cover: String(item.cover || "assets/avatar.jpg").trim().replace(/\\/g, "/"),
      src: String(item.src || "").trim().replace(/\\/g, "/"),
      note: String(item.note || "").trim(),
      lyrics: String(item.lyrics || "").trim(),
      source: String(item.source || "local").trim(),
      sourceId: String(item.sourceId || item.neteaseId || "").trim(),
      status: String(item.status || "visible").trim(),
    }))
    .map((item) => ({ ...item, lyricLines: parseLyrics(item.lyrics) }))
    .filter((item) => item.title !== "[object Object]" && item.src && item.status !== "draft");

  return normalized.length ? normalized : defaultMusicPlaylist;
}

function syncMusicSelection(index) {
  currentMusicIndex = Number(index) || 0;
  document.querySelectorAll("[data-music-select]").forEach((button) => {
    const isActive = Number(button.dataset.musicSelect) === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderMusicLyrics(track, activeIndex = -1) {
  if (!musicLyricBoard) return;
  const lines = track?.lyricLines || parseLyrics(track?.lyrics || "");
  if (!lines.length) {
    musicLyricBoard.innerHTML = `
      <p class="music-lyrics-empty">${escapeHtml(track?.note || "纯音乐 无歌词")}</p>
    `;
    return;
  }

  musicLyricBoard.innerHTML = lines.map((line, index) => `
    <p class="music-lyric-line ${index === activeIndex ? "is-active" : ""}" data-lyric-line="${index}">
      <span class="music-lyric-original">${escapeHtml(splitLyricText(line.text).primary)}</span>
      ${splitLyricText(line.text).secondary ? `<span class="music-lyric-translation">${escapeHtml(splitLyricText(line.text).secondary)}</span>` : ""}
    </p>
  `).join("");
}

function updateActiveMusicLyric(track, seconds) {
  if (!track?.lyricLines?.length || track.lyricLines.every((line) => line.time === null)) return -1;
  let activeIndex = -1;
  track.lyricLines.forEach((line, index) => {
    if (line.time !== null && line.time <= seconds + 0.15) activeIndex = index;
  });
  return activeIndex;
}

function setActiveMusicLyric(index) {
  if (!musicLyricBoard) return;
  musicLyricBoard.querySelectorAll("[data-lyric-line]").forEach((line) => {
    const isActive = Number(line.dataset.lyricLine) === index;
    line.classList.toggle("is-active", isActive);
    if (isActive) {
      line.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });
}

function renderMusicTrackList() {
  if (!musicListBoard) return;
  const query = currentMusicSearch.trim().toLowerCase();
  const visibleItems = activeMusicPlaylist
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => !query
      || track.title.toLowerCase().includes(query)
      || track.artist.toLowerCase().includes(query)
      || track.note.toLowerCase().includes(query));

  if (!visibleItems.length) {
    musicListBoard.innerHTML = `<p class="music-lyrics-empty">没有找到匹配的音轨。</p>`;
    return;
  }

  musicListBoard.innerHTML = visibleItems.map(({ track, index }) => `
    <button class="music-track-card ${index === currentMusicIndex ? "is-active" : ""}" type="button" data-music-select="${index}" aria-pressed="${index === currentMusicIndex ? "true" : "false"}">
      <span class="music-track-cover"><img src="${escapeHtml(track.cover || "assets/avatar.jpg")}" alt="" loading="lazy"></span>
      <span class="music-track-body">
        <strong>${escapeHtml(track.title)}</strong>
        <span>${escapeHtml(track.artist)}</span>
        <em>${escapeHtml(track.note || "点击切换到这首歌")}</em>
      </span>
    </button>
  `).join("");

  musicListBoard.querySelectorAll("[data-music-select]").forEach((button) => {
    addPageListener(button, "click", () => {
      const index = Number(button.dataset.musicSelect) || 0;
      playMusicIndex(index, true);
    });
  });
}

function configureMusicPlaylist(value) {
  const previousSrc = activeMusicPlaylist[currentMusicIndex]?.src || "";
  activeMusicPlaylist = normalizeMusicPlaylist(value);
  if (currentMusicIndex >= activeMusicPlaylist.length) currentMusicIndex = 0;
  const nextSrc = activeMusicPlaylist[currentMusicIndex]?.src || "";
  if (!globalMusicAudio.src || previousSrc !== nextSrc) loadMusicTrack(currentMusicIndex, false);
  updateMusicPlayers();
  renderMusicTrackList();
  syncMusicSelection(currentMusicIndex);
  renderMusicLyrics(activeMusicPlaylist[currentMusicIndex], activeLyricIndex);
}

function setMusicPanelView(name) {
  const nextName = name === "playlist" ? "playlist" : "lyrics";
  musicPanelTabs.forEach((button) => {
    const isActive = button.dataset.musicPanelTab === nextName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  musicPanelViews.forEach((view) => {
    view.hidden = view.dataset.musicPanel !== nextName;
  });
}

function padTime(value) {
  return String(value).padStart(2, "0");
}

function formatUptime(milliseconds) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return `${days}天${hours}小时${minutes}分`;
}

function updateRuntimeClock() {
  const clock = document.querySelector("[data-site-clock]");
  const uptime = document.querySelector("[data-site-uptime]");
  if (!clock && !uptime) return;

  const now = new Date();
  if (clock) {
    clock.textContent = `${padTime(now.getHours())}:${padTime(now.getMinutes())}:${padTime(now.getSeconds())}`;
    clock.dateTime = now.toISOString();
  }
  if (uptime) uptime.textContent = formatUptime(now.getTime() - runtimeConfig.onlineSince);
}

function qqLink(qq) {
  return `tencent://message/?uin=${encodeURIComponent(qq)}&Site=Galois37&Menu=yes`;
}

function renderRichText(target, value) {
  if (!target || !value) return;
  target.innerHTML = value
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.every((line) => line.startsWith("•"))) {
        return `<ul class="clean-list">${lines.map((line) => `<li>${escapeHtml(line.replace(/^•\s*/, ""))}</li>`).join("")}</ul>`;
      }
      return lines.map((line) => {
        if (/^(数学品味与兴趣|数学之外呢|履历)$/.test(line)) return `<h3>${escapeHtml(line)}</h3>`;
        return `<p>${escapeHtml(line)}</p>`;
      }).join("");
    })
    .join("");
}

function applySettingTextNodes(data) {
  document.querySelectorAll("[data-setting-text]").forEach((node) => {
    const key = node.dataset.settingText;
    const value = data[key];
    if (value == null || value === "") return;
    if (node.dataset.settingFormat === "lines") {
      node.innerHTML = escapeHtml(value).replace(/\n/g, "<br>");
      return;
    }
    node.textContent = value;
  });
}

function matchActionMarkup() {
  return `
    <span class="match-inline-wrap">
      <button class="button secondary inline-button" type="button" data-match-placeholder>成分重合度测试</button>
      <span class="match-inline-hint" data-match-hint hidden>该功能还待主人开发喵~</span>
    </span>
  `;
}

function ensureMatchAction() {
  const target = document.querySelector("[data-about-bio]");
  if (!target || target.querySelector("[data-match-placeholder]")) return;
  const anchor = target.querySelector("[data-match-action-anchor]");
  if (anchor) {
    anchor.outerHTML = matchActionMarkup();
    return;
  }
  const marker = Array.from(target.querySelectorAll("li, p"))
    .find((node) => node.textContent.includes("成分重合度"));
  if (marker) {
    marker.insertAdjacentHTML("afterend", matchActionMarkup());
  } else {
    target.insertAdjacentHTML("beforeend", matchActionMarkup());
  }
}

function applySettings(settings) {
  const data = { ...defaultSettings, ...settings };
  configureRuntime(data);
  configureMusicPlaylist(data["music.playlist"]);
  applySettingTextNodes(data);
  const siteName = data["site.name"];
  setText(".brand span:last-child", siteName);
  if (document.body.dataset.page === "home") document.title = siteName;
  setText("#home-title", siteName);
  setText(".home-persona-head h2", data["home.nickname"]);
  setText(".profile-line", data["home.subtitle"]);
  renderRichText(document.querySelector("[data-about-bio]"), data["about.bio"]);
  ensureMatchAction();

  setHref(".zhihu-link, .social-card[href*='zhihu.com']", data["social.zhihu"]);
  setHref(".xhs-link, .social-card[href*='xhslink.com']", data["social.xhs"]);
  setHref(".github-link, .social-card[href*='github.com']", data["social.github"]);
  setHref(".mail-link, .social-card[href^='mailto:']", `mailto:${data["social.email"]}`);
  setHref(".qq-link, .social-card[href^='tencent://']", qqLink(data["social.qq"]));

  const socialCards = document.querySelectorAll(".social-card strong");
  if (socialCards[0]) socialCards[0].textContent = data["home.nickname"];
  if (socialCards[1]) socialCards[1].textContent = data["home.nickname"];
  if (socialCards[2]) socialCards[2].textContent = data["social.qq"];
  if (socialCards[3]) socialCards[3].textContent = data["social.email"];
  if (socialCards[4]) socialCards[4].textContent = data["home.nickname"];

  setText(".notes-room h3", data["rooms.notesTitle"]);
  setText(".articles-room h3", data["rooms.articlesTitle"]);
  setText(".ask-room h3", data["rooms.askTitle"]);
  if (document.body.dataset.page === "notes") setText(".page-hero h1", data["rooms.notesTitle"]);
  if (document.body.dataset.page === "articles") setText(".page-hero h1", data["rooms.articlesTitle"]);
  if (document.body.dataset.page === "ask") setText(".page-hero h1", data["rooms.askTitle"]);
  ensureMatchAction();
}

async function loadSettings() {
  try {
    const { response, result } = await fetchJsonWithTimeout("/api/settings", {}, 1800);
    if (response.ok) {
      cachedSettings = result.settings || {};
      applySettings(cachedSettings);
    }
  } catch {
    cachedSettings = cachedSettings || {};
  }
}

function renderContentItem(item, pageType) {
  const meta = parseContentMeta(item);
  const label = escapeHtml(meta.label);
  const title = escapeHtml(item.title || "");
  const description = escapeHtml(item.description || "");
  const url = escapeHtml(assetUrlWithVersion(item.url || "#", item.updated_at || item.id));
  const linkText = item.type === "note" ? "打开 PDF" : "打开链接";
  const createdAt = escapeHtml(item.created_at || "");
  const dateText = escapeHtml((item.created_at || "").slice(0, 10) || "长期维护中");
  const statusText = item.type === "note" ? "长期连载中" : "长期展示中";
  const cover = escapeHtml(assetUrlWithVersion(meta.cover, item.updated_at || item.id));
  if (pageType === "notes") {
    return `
      <article class="note-item content-card visual-content-card">
        <a class="content-cover" href="${url}" target="_blank" rel="noreferrer" aria-label="${title}">
          <img src="${cover}" alt="" loading="lazy">
        </a>
        <div class="content-body">
          <div class="content-meta-line">
            <span class="tag">${label}</span>
            <time class="content-date" datetime="${createdAt}">${escapeHtml(item.status === "visible" ? statusText : item.status)}</time>
          </div>
          <h2>${title}</h2>
          <p>${description}</p>
          <div class="content-actions">
            <a class="note-link" href="${url}" target="_blank" rel="noreferrer">${linkText}</a>
            <span>${dateText}</span>
          </div>
        </div>
      </article>
    `;
  }
  return `
    <article class="article-card content-card visual-content-card">
      <a class="content-cover" href="${url}" target="_blank" rel="noreferrer" aria-label="${title}">
        <img src="${cover}" alt="" loading="lazy">
      </a>
      <div class="content-body">
        <div class="content-meta-line">
          <span class="tag">${label}</span>
          <time class="content-date" datetime="${createdAt}">${statusText}</time>
        </div>
        <h2>${title}</h2>
        <p>${description}</p>
        <div class="content-actions">
          <a class="note-link" href="${url}" target="_blank" rel="noreferrer">${linkText}</a>
          <span>${dateText}</span>
        </div>
      </div>
    </article>
  `;
}

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function formatLargeNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(Number(value) || 0);
}

function updateHomeStats(items) {
  const notes = items.filter((item) => item.type === "note").length;
  const works = items.filter((item) => ["article", "program"].includes(item.type)).length;
  const map = { notes, works };
  Object.entries(map).forEach(([key, value]) => {
    const target = document.querySelector(`[data-stat-count="${key}"]`);
    if (target) target.textContent = formatCount(value);
  });
}

async function loadHomeStats() {
  if (document.body.dataset.page !== "home") return;
  try {
    const response = await fetch("/api/stats");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return;
    const askCount = document.querySelector('[data-stat-count="asks"]');
    if (askCount) askCount.textContent = formatCount(result.totalPublicMessages || 0);
    const visitorCount = document.querySelector("[data-total-visitors]");
    const viewCount = document.querySelector("[data-total-views]");
    if (visitorCount) visitorCount.textContent = formatLargeNumber(result.totalVisitors ?? runtimeConfig.baseVisitors);
    if (viewCount) viewCount.textContent = formatLargeNumber(result.totalViews ?? runtimeConfig.baseViews);
  } catch {
  }
}

function contentTypeName(type) {
  return ({
    note: "笔记",
    article: "文章",
    program: "项目",
    moment: "说说",
    friend: "友链",
  })[type] || type;
}

function renderArchive(items) {
  if (!archiveBoard) return;
  const visibleItems = items.filter((item) => item.type !== "friend" && item.type !== "resource");
  if (!visibleItems.length) {
    archiveBoard.innerHTML = `<article class="glass-card"><h2>归档还在整理中</h2><p>公开内容会按时间出现在这里。</p></article>`;
    return;
  }
  archiveBoard.innerHTML = visibleItems.map((item) => `
    <article class="archive-item content-card visual-content-card">
      <a class="content-cover" href="${escapeHtml(item.url ? assetUrlWithVersion(item.url, item.updated_at || item.id) : "#")}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(item.title || "")}">
        <img src="${escapeHtml(assetUrlWithVersion(parseContentMeta(item).cover, item.updated_at || item.id))}" alt="" loading="lazy">
      </a>
      <div class="content-body">
        <div class="content-meta-line">
          <span class="tag">${escapeHtml(contentTypeName(item.type))}</span>
          <time datetime="${escapeHtml(item.created_at || "")}">${escapeHtml(formatQaDate(item.created_at) || (item.created_at || "").slice(0, 10) || "未记录")}</time>
        </div>
        <h2>${escapeHtml(item.title || "")}</h2>
        <p>${escapeHtml(item.description || "")}</p>
        ${item.url ? `<div class="content-actions"><a class="note-link" href="${escapeHtml(assetUrlWithVersion(item.url, item.updated_at || item.id))}" target="_blank" rel="noreferrer">打开链接</a></div>` : ""}
      </div>
    </article>
  `).join("");
}

function splitImageUrls(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function formatMomentDate(value) {
  if (!value) return "刚刚";
  const raw = String(value);
  const datePart = raw.slice(0, 10).replace(/-/g, ".");
  const timePart = raw.includes("T") ? raw.slice(11, 16) : raw.slice(11, 16);
  return timePart ? `${datePart} ${timePart}` : datePart;
}

function renderMoments(items) {
  if (!momentsBoard) return;
  if (!items.length) {
    momentsBoard.innerHTML = `<article class="glass-card"><h2>还没有说说</h2><p>可以在控制台的“说说”分区发布第一条动态。</p></article>`;
    return;
  }
  momentsBoard.innerHTML = items.map((item) => {
    const imageUrls = splitImageUrls(item.image_url);
    const authorName = item.author_name || "Galois37的猫猫";
    const ownerBadge = authorName === "Galois37的猫猫" ? `<span class="owner-mini-badge">站长认证</span>` : "";
    const background = item.background_url
      ? ` style="--moment-bg: url('${escapeHtml(item.background_url)}')"`
      : "";
    return `
    <article class="moment-card"${background}>
      <header class="moment-head">
        <img class="moment-avatar" src="assets/avatar.jpg" alt="${escapeHtml(authorName)} 的头像" loading="lazy">
        <div>
          <strong>${escapeHtml(authorName)}${ownerBadge}</strong>
          <time datetime="${escapeHtml(item.created_at || "")}">${escapeHtml(formatMomentDate(item.created_at))}</time>
        </div>
      </header>
      <div class="moment-content">
        <p>${escapeHtml(item.content || "")}</p>
      </div>
      ${imageUrls.length ? `<div class="moment-gallery" data-count="${imageUrls.length}">${imageUrls.map((url, index) => (
        `<img class="moment-image" src="${escapeHtml(url)}" alt="说说配图 ${index + 1}" loading="lazy">`
      )).join("")}</div>` : ""}
      <footer class="moment-foot">
        <span>Galois37's Room</span>
        <span>评论功能施工中</span>
      </footer>
    </article>
  `;
  }).join("");
}

async function loadMomentsPage() {
  if (!momentsBoard) return;
  try {
    const response = await fetch("/api/moments");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "读取失败");
    renderMoments(result.items || []);
  } catch (error) {
    momentsBoard.innerHTML = `<article class="glass-card"><h2>读取失败</h2><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function renderFriends(items) {
  if (!friendsBoard) return;
  const friends = items.filter((item) => item.type === "friend" && (item.status || "visible") === "visible");
  if (!friends.length) {
    friendsBoard.innerHTML = `<article class="glass-card friend-empty"><h2>友链位招租中</h2><p>可以在控制台的“友链”分区添加朋友的网站。</p></article>`;
    return;
  }
  friendsBoard.innerHTML = friends.map((item) => `
    <a class="friend-card" href="${escapeHtml(item.url || "#")}" target="_blank" rel="noreferrer">
      <span class="friend-orbit" aria-hidden="true"></span>
      <span class="friend-avatar">
        ${item.label ? `<img src="${escapeHtml(imageUrlWithVersion(item.label, item.updated_at || item.id))}" alt="${escapeHtml(item.title || "友链")} 的头像" loading="lazy">` : `<span>${escapeHtml((item.title || "友").slice(0, 1))}</span>`}
      </span>
      <span class="friend-body">
        <span class="friend-meta"><span class="friend-dot"></span> Online</span>
        <strong>${escapeHtml(item.title || "")}</strong>
        <span>${escapeHtml(item.description || "这个朋友还没有写简介。")}</span>
      </span>
      <span class="friend-arrow" aria-hidden="true">↗</span>
    </a>
  `).join("");
}

async function loadContentItems() {
  const pageType = document.body.dataset.page;
  const list = pageType === "notes"
    ? document.querySelector(".note-list")
    : pageType === "articles"
      ? document.querySelector(".article-list")
      : null;
  if (!list && !archiveBoard && !friendsBoard && pageType !== "home") return;

  let allItems = defaultContentItems;
  try {
    const { response, result } = await fetchJsonWithTimeout("/api/content-items", {}, 2200);
    if (response.ok && Array.isArray(result.items) && result.items.length) {
      allItems = result.items;
    }
  } catch {
    allItems = defaultContentItems;
  }

  updateHomeStats(allItems);
  if (archiveBoard) {
    renderArchive(allItems);
    return;
  }
  if (friendsBoard) {
    renderFriends(allItems);
    return;
  }
  const items = allItems.filter((item) => (
    pageType === "notes" ? item.type === "note" : item.type === "article" || item.type === "program"
  ));
  if (items.length && list) {
    list.innerHTML = items.map((item) => renderContentItem(item, pageType)).join("");
  }
}

function authHeaders() {
  const token = localStorage.getItem(userTokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function setUser(user) {
  currentUser = user;
  if (guestPanel) guestPanel.hidden = Boolean(user);
  if (userPanel) userPanel.hidden = !user;
  if (currentUserText) {
    currentUserText.innerHTML = user
      ? `${escapeHtml(user.displayName || user.username)} ${ownerBadge(user.role)}`
      : "";
  }
  if (privateSection) privateSection.hidden = !user;
}

async function loadPublicMessages() {
  if (!publicMessages) return;
  try {
    const response = await fetch("/api/messages", { headers: authHeaders() });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "读取失败");
    const items = result.items || [];
    const publicItems = items.filter((item) => item.status === "public" && item.answer);
    const privateItems = currentUser
      ? items.filter((item) => item.user_id === currentUser.id && item.status === "private" && item.answer)
      : [];

    renderMessages(
      publicMessages,
      publicItems,
      "暂时还没有公开问答",
      "提交的问题会先进入后台，等 Galois37 回复并选择公开后才会显示在这里。"
    );
    renderMessages(
      privateMessages,
      privateItems,
      "暂时还没有私人回复",
      "登录后提问并收到私人回复时，会显示在这里。"
    );
    const askCount = document.querySelector('[data-stat-count="asks"]');
    if (askCount) askCount.textContent = formatCount(publicItems.length);
  } catch (error) {
    publicMessages.innerHTML = `
      <article>
        <strong>读取失败</strong>
        <p>${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

async function loadCurrentUser() {
  const token = localStorage.getItem(userTokenKey);
  if (!token) {
    setUser(null);
    return;
  }
  try {
    const response = await fetch("/api/users/me", { headers: authHeaders() });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.user) throw new Error("登录已失效");
    setUser(result.user);
  } catch {
    localStorage.removeItem(userTokenKey);
    setUser(null);
  }
}

function createDemoToneUrl() {
  const sampleRate = 44100;
  const duration = 10;
  const channels = 1;
  const bytesPerSample = 2;
  const sampleCount = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + sampleCount * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset, value) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + sampleCount * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, sampleCount * bytesPerSample, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const note = Math.floor(t * 2) % 4;
    const freq = [392, 523.25, 659.25, 784][note];
    const envelope = Math.min(1, t * 4) * Math.min(1, (duration - t) * 2);
    const wave = Math.sin(2 * Math.PI * freq * t) * 0.22 * envelope;
    view.setInt16(44 + i * bytesPerSample, Math.max(-1, Math.min(1, wave)) * 32767, true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function formatMusicTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function currentMusicTrack() {
  return activeMusicPlaylist[currentMusicIndex] || defaultMusicPlaylist[0];
}

function normalizedAudioUrl(src) {
  try {
    return new URL(src || "", window.location.href).href;
  } catch {
    return "";
  }
}

function loadMusicTrack(index = currentMusicIndex, resetTime = true) {
  const nextIndex = Number(index);
  currentMusicIndex = Number.isFinite(nextIndex)
    ? (nextIndex + activeMusicPlaylist.length) % activeMusicPlaylist.length
    : 0;
  activeLyricIndex = -1;
  const song = currentMusicTrack();
  if (!demoToneUrl) demoToneUrl = createDemoToneUrl();
  const nextSrc = normalizedAudioUrl(song.src || demoToneUrl);
  if (globalMusicAudio.src !== nextSrc) {
    globalMusicAudio.src = nextSrc;
    globalMusicAudio.load();
  }
  if (resetTime) {
    try {
      globalMusicAudio.currentTime = 0;
    } catch {
    }
  }
  updateMusicPlayers();
}

function setPlayerLyric(root, value) {
  const lyric = root.querySelector("[data-music-lyric]");
  if (!lyric) return;
  const text = lyricPreviewText(value);
  lyric.textContent = text;
  lyric.hidden = !text;
}

function updateMusicRoot(root) {
  const song = currentMusicTrack();
  const cover = root.querySelector("[data-music-cover]");
  const title = root.querySelector("[data-music-title]");
  const artist = root.querySelector("[data-music-artist]");
  const current = root.querySelector("[data-music-current]");
  const duration = root.querySelector("[data-music-duration]");
  const progress = root.querySelector("[data-music-progress]");
  const icon = root.querySelector("[data-music-icon]");
  const counter = root.querySelector("[data-music-counter]");
  const activeLine = song.lyricLines?.[activeLyricIndex]?.text;

  root.classList.toggle("is-playing", !globalMusicAudio.paused);
  if (cover) cover.src = song.cover || "assets/avatar.jpg";
  if (title) title.textContent = song.title || "未命名音轨";
  if (artist) artist.textContent = song.artist || "未知作者";
  if (icon) icon.textContent = globalMusicAudio.paused ? "▶" : "Ⅱ";
  if (current) current.textContent = formatMusicTime(globalMusicAudio.currentTime);
  if (duration) duration.textContent = formatMusicTime(globalMusicAudio.duration);
  if (progress) progress.value = globalMusicAudio.duration
    ? String((globalMusicAudio.currentTime / globalMusicAudio.duration) * 100)
    : "0";
  if (counter) counter.textContent = `${currentMusicIndex + 1} / ${activeMusicPlaylist.length}`;
  setPlayerLyric(root, activeLine || (song.lyricLines?.[0]?.text || song.note || ""));
}

function updateMusicPlayers() {
  musicControllers = [...musicPlayerRoots];
  musicControllers.forEach(updateMusicRoot);
  syncMusicSelection(currentMusicIndex);
}

async function playCurrentMusic() {
  shouldContinueMusic = true;
  if (!globalMusicAudio.src) loadMusicTrack(currentMusicIndex, false);
  try {
    await globalMusicAudio.play();
  } catch {
    musicControllers.forEach((root) => setPlayerLyric(root, "浏览器阻止了播放，请再点一次播放按钮。"));
  } finally {
    updateMusicPlayers();
  }
}

function pauseCurrentMusic() {
  shouldContinueMusic = false;
  globalMusicAudio.pause();
  updateMusicPlayers();
}

function playMusicIndex(index, autoplay = false) {
  loadMusicTrack(index, true);
  if (autoplay || shouldContinueMusic) playCurrentMusic();
  else updateMusicPlayers();
  renderMusicLyrics(currentMusicTrack(), -1);
}

function bindMusicPlayers() {
  musicPlayerRoots.forEach((root) => {
    addPageListener(root.querySelector("[data-music-toggle]"), "click", () => {
      if (globalMusicAudio.paused) playCurrentMusic();
      else pauseCurrentMusic();
    });
    addPageListener(root.querySelector("[data-music-prev]"), "click", () => playMusicIndex(currentMusicIndex - 1, true));
    addPageListener(root.querySelector("[data-music-next]"), "click", () => playMusicIndex(currentMusicIndex + 1, true));
    addPageListener(root.querySelector("[data-music-progress]"), "input", (event) => {
      if (!globalMusicAudio.duration) return;
      globalMusicAudio.currentTime = (Number(event.currentTarget.value) / 100) * globalMusicAudio.duration;
      updateMusicPlayers();
    });
  });
  updateMusicPlayers();
  renderMusicTrackList();
  renderMusicLyrics(currentMusicTrack(), activeLyricIndex);
}

globalMusicAudio.addEventListener("loadedmetadata", updateMusicPlayers);

globalMusicAudio.addEventListener("timeupdate", () => {
  const song = currentMusicTrack();
  const nextLyricIndex = updateActiveMusicLyric(song, globalMusicAudio.currentTime);
  if (nextLyricIndex !== activeLyricIndex) {
    activeLyricIndex = nextLyricIndex;
    setActiveMusicLyric(nextLyricIndex);
  }
  updateMusicPlayers();
});

globalMusicAudio.addEventListener("play", updateMusicPlayers);
globalMusicAudio.addEventListener("pause", updateMusicPlayers);
globalMusicAudio.addEventListener("ended", () => playMusicIndex(currentMusicIndex + 1, true));
globalMusicAudio.addEventListener("error", () => {
  musicControllers.forEach((root) => setPlayerLyric(root, "音频路径读取失败，请检查控制台里的音频路径。"));
  updateMusicPlayers();
});

function bindCurrentPageEvents() {
  pageAbortController?.abort();
  pageAbortController = new AbortController();

  const friendApplyForm = document.querySelector("[data-friend-apply-form]");
  addPageListener(friendApplyForm, "submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("[data-friend-apply-status]");
    const button = friendApplyForm.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(friendApplyForm).entries());
    if (status) status.textContent = "正在发送友链申请...";
    if (button) button.disabled = true;
    try {
      const response = await fetch("/api/friend-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "发送失败，请稍后再试。");
      if (status) status.textContent = "已发送，站长会在控制台里看到这条申请。";
    } catch (error) {
      if (status) status.textContent = error.message;
    } finally {
      if (button) button.disabled = false;
    }
  });

  musicPanelTabs.forEach((button) => {
    addPageListener(button, "click", () => setMusicPanelView(button.dataset.musicPanelTab));
  });

  addPageListener(musicSearchInput, "input", () => {
    currentMusicSearch = musicSearchInput.value || "";
    renderMusicTrackList();
    syncMusicSelection(currentMusicIndex);
  });

  authModeButtons.forEach((button) => {
    addPageListener(button, "click", () => setAuthMode(button.dataset.authModeButton));
  });

  addPageListener(messageForm, "submit", async (event) => {
    event.preventDefault();
    const status = messageForm.querySelector(".form-status");
    const submitButton = messageForm.querySelector('button[type="submit"]');
    const formData = new FormData(messageForm);
    const payload = {
      message: formData.get("message") || "",
    };

    if (!payload.message.trim()) {
      if (status) status.textContent = "请先写一点内容。";
      return;
    }

    if (status) status.textContent = "正在发送...";
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "提交失败");
      messageForm.reset();
      if (status) status.textContent = currentUser
        ? "已经送达后台。收到私人或公开回复后，会在右侧显示。"
        : "已经送达后台。匿名提问可以被公开回答；如需私人回复，请先登录后提问。";
      await loadPublicMessages();
    } catch (error) {
      if (status) status.textContent = `发送失败：${error.message}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  addPageListener(userForm, "submit", async (event) => {
    event.preventDefault();
    const action = userForm.dataset.authMode || "login";
    const status = userForm.querySelector(".form-status");
    const formData = new FormData(userForm);
    const payload = {
      username: formData.get("username") || "",
      displayName: formData.get("displayName") || "",
      password: formData.get("password") || "",
    };

    if (status) status.textContent = action === "register" ? "正在注册..." : "正在登录...";

    try {
      const response = await fetch(`/api/users/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "操作失败");
      localStorage.setItem(userTokenKey, result.token);
      userForm.reset();
      setUser(result.user);
      await loadPublicMessages();
    } catch (error) {
      if (status) status.textContent = error.message;
    }
  });

  addPageListener(logoutButton, "click", async () => {
    localStorage.removeItem(userTokenKey);
    setUser(null);
    await loadPublicMessages();
  });

  bindMusicPlayers();
}

function trackPageView() {
  const blob = new Blob([JSON.stringify({ path: location.pathname })], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/stats", blob);
    return;
  }
  fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: location.pathname }),
  }).catch(() => {});
}

async function initCurrentPage({ countView = false } = {}) {
  refreshDomRefs();
  if (Object.keys(cachedSettings).length) {
    applySettings(cachedSettings);
  } else {
    await loadSettings();
  }
  bindCurrentPageEvents();
  setUser(currentUser);
  await loadContentItems();
  await loadMomentsPage();
  await loadHomeStats();
  await loadCurrentUser();
  await loadPublicMessages();
  if (countView) trackPageView();
}

function isRoutablePageLink(anchor) {
  if (!anchor || anchor.target || anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
  if (url.pathname.includes("/api/") || url.pathname.includes("/assets/")) return false;
  if (url.pathname.endsWith("/admin.html") || url.pathname.endsWith("/admin")) return false;
  return url.pathname === "/" || url.pathname.endsWith(".html");
}

async function navigateToPage(nextUrl, { push = true } = {}) {
  const url = new URL(nextUrl, window.location.href);
  try {
    document.documentElement.classList.add("is-page-loading");
    const response = await fetch(url.href, { headers: { "X-Requested-With": "Galois37-PJAX" } });
    if (!response.ok) throw new Error("页面读取失败");
    const html = await response.text();
    const nextDoc = new DOMParser().parseFromString(html, "text/html");
    const nextMain = nextDoc.querySelector("main");
    const currentMain = document.querySelector("main");
    if (!nextMain || !currentMain) throw new Error("页面结构不完整");

    document.title = nextDoc.title || document.title;
    document.body.dataset.page = nextDoc.body.dataset.page || "home";
    currentMain.replaceWith(nextMain);
    if (push) history.pushState({ pjax: true }, "", url.href);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
    await initCurrentPage({ countView: true });
  } catch {
    window.location.href = url.href;
  } finally {
    document.documentElement.classList.remove("is-page-loading");
  }
}

function bindShellEvents() {
  navToggle?.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(themeKey, nextTheme);
    applyTheme(nextTheme);
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const matchButton = event.target instanceof Element ? event.target.closest("[data-match-placeholder]") : null;
    if (matchButton) {
      event.preventDefault();
      const hint = matchButton.closest(".match-inline-wrap")?.querySelector("[data-match-hint]");
      if (hint) {
        hint.hidden = false;
        hint.classList.add("is-visible");
      }
      return;
    }
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;
    if (!isRoutablePageLink(anchor)) return;
    event.preventDefault();
    siteNav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navigateToPage(anchor.href);
  });

  window.addEventListener("popstate", () => {
    navigateToPage(window.location.href, { push: false });
  });
}

bindShellEvents();
history.replaceState({ pjax: true }, "", window.location.href);
void initCurrentPage({ countView: true });
