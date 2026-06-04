const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const themeToggle = document.querySelector("[data-theme-toggle]");
const musicPlayerRoot = document.querySelector("[data-music-player]");
const messageForm = document.querySelector("[data-message-form], [data-static-form]");
const publicMessages = document.querySelector("[data-public-messages]");
const privateMessages = document.querySelector("[data-private-messages]");
const resourceBoard = document.querySelector("[data-resource-board]");
const archiveBoard = document.querySelector("[data-archive-board]");
const momentsBoard = document.querySelector("[data-moments-board]");
const friendsBoard = document.querySelector("[data-friends-board]");
const privateSection = document.querySelector("[data-private-section]");
const userForm = document.querySelector("[data-user-form]");
const authModeButtons = document.querySelectorAll("[data-auth-mode-button]");
const registerOnly = document.querySelector("[data-register-only]");
const authNote = document.querySelector("[data-auth-note]");
const authSubmit = document.querySelector("[data-auth-submit]");
const guestPanel = document.querySelector("[data-guest-panel]");
const userPanel = document.querySelector("[data-user-panel]");
const currentUserText = document.querySelector("[data-current-user]");
const logoutButton = document.querySelector("[data-logout]");
const userTokenKey = "galois37_user_token";
const themeKey = "galois37_theme";

let currentUser = null;
const ownerDisplayName = "Galois37的猫猫";

const defaultSettings = {
  "site.name": "Galois37の完美算术教室",
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
};

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

function renderMessages(target, items, emptyTitle, emptyText) {
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `
      <article>
        <strong>${escapeHtml(emptyTitle)}</strong>
        <p>${escapeHtml(emptyText)}</p>
      </article>
    `;
    return;
  }

  target.innerHTML = items.map((item) => `
    <article class="qa-item">
      <div class="qa-question">
        <strong>${escapeHtml(item.name || "匿名用户")} ${ownerBadge(item.role)}提问</strong>
        <p>${escapeHtml(item.message || "")}</p>
      </div>
      <div class="qa-answer">
        <strong>${ownerDisplayName} ${ownerBadge("owner")}回答</strong>
        <p>${escapeHtml(item.answer || "")}</p>
      </div>
    </article>
  `).join("");
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

function applySettings(settings) {
  const data = { ...defaultSettings, ...settings };
  const siteName = data["site.name"];
  setText(".brand span:last-child", siteName);
  if (document.body.dataset.page === "home") document.title = siteName;
  setText("#home-title", siteName);
  setText(".home-persona-head h2", data["home.nickname"]);
  setText(".profile-line", data["home.subtitle"]);
  setText(".about-hero p:not(.eyebrow)", data["about.quote"]);
  renderRichText(document.querySelector("[data-about-bio]"), data["about.bio"]);

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
}

async function loadSettings() {
  try {
    const response = await fetch("/api/settings");
    const result = await response.json().catch(() => ({}));
    if (response.ok) applySettings(result.settings || {});
  } catch {
  }
}

function renderContentItem(item, pageType) {
  const label = escapeHtml(item.label || (item.type === "note" ? "PDF" : "Program"));
  const title = escapeHtml(item.title || "");
  const description = escapeHtml(item.description || "");
  const url = escapeHtml(assetUrlWithVersion(item.url || "#", item.updated_at || item.id));
  const linkText = item.type === "note" ? "打开 PDF" : "打开链接";
  if (pageType === "notes") {
    return `
      <article class="note-item">
        <time datetime="${escapeHtml(item.created_at || "")}">${escapeHtml(item.status === "visible" ? "长期连载中" : item.status)}</time>
        <div>
          <span class="tag">${label}</span>
          <h2>${title}</h2>
          <p>${description}</p>
          <a class="note-link" href="${url}" target="_blank" rel="noreferrer">${linkText}</a>
        </div>
      </article>
    `;
  }
  return `
    <article class="article-card">
      <div>
        <span class="tag">${label}</span>
        <h2>${title}</h2>
        <p>${description}</p>
        <a class="note-link" href="${url}" target="_blank" rel="noreferrer">${linkText}</a>
      </div>
      <time datetime="${escapeHtml(item.created_at || "")}">长期展示中</time>
    </article>
  `;
}

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function updateHomeStats(items) {
  const notes = items.filter((item) => item.type === "note").length;
  const resourceLibraryEntry = 1;
  const works = items.filter((item) => ["article", "program", "resource"].includes(item.type)).length + resourceLibraryEntry;
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
    if (askCount) askCount.textContent = formatCount(result.totalMessages || 0);
  } catch {
  }
}

function renderResources(items) {
  if (!resourceBoard) return;
  if (!items.length) {
    resourceBoard.innerHTML = `
      <article class="glass-card">
        <h2>资源库还在建设中</h2>
        <p>可以在控制台中新增 resource 类型条目，保存后会显示在这里。</p>
      </article>
    `;
    return;
  }

  const groups = items.reduce((map, item) => {
    const label = item.label || "未分类";
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(item);
    return map;
  }, new Map());

  resourceBoard.innerHTML = [...groups.entries()].map(([label, entries]) => `
    <section class="resource-group">
      <div class="section-title">
        <p class="eyebrow">Resource</p>
        <h2>${escapeHtml(label)}</h2>
      </div>
      <div class="resource-grid">
        ${entries.map((item) => `
          <a class="glass-card resource-card" href="${escapeHtml(item.url || "#")}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.description || "")}</p>
          </a>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function contentTypeName(type) {
  return ({
    note: "笔记",
    article: "文章",
    program: "项目",
    resource: "资源",
    moment: "说说",
    friend: "友链",
  })[type] || type;
}

function renderArchive(items) {
  if (!archiveBoard) return;
  const visibleItems = items.filter((item) => item.type !== "friend");
  if (!visibleItems.length) {
    archiveBoard.innerHTML = `<article class="glass-card"><h2>归档还在整理中</h2><p>公开内容会按时间出现在这里。</p></article>`;
    return;
  }
  archiveBoard.innerHTML = visibleItems.map((item) => `
    <article class="archive-item">
      <time datetime="${escapeHtml(item.created_at || "")}">${escapeHtml((item.created_at || "").slice(0, 10) || "未记录")}</time>
      <div>
        <span class="tag">${escapeHtml(contentTypeName(item.type))}</span>
        <h2>${escapeHtml(item.title || "")}</h2>
        <p>${escapeHtml(item.description || "")}</p>
        ${item.url ? `<a class="note-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">打开链接</a>` : ""}
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
  return String(value).slice(0, 10).replace(/-/g, ".");
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
    const background = item.background_url
      ? ` style="--moment-bg: url('${escapeHtml(item.background_url)}')"`
      : "";
    return `
    <article class="moment-card"${background}>
      <header class="moment-head">
        <img class="moment-avatar" src="assets/avatar.jpg" alt="${escapeHtml(authorName)} 的头像" loading="lazy">
        <div>
          <strong>${escapeHtml(authorName)}</strong>
          <time datetime="${escapeHtml(item.created_at || "")}">${escapeHtml(formatMomentDate(item.created_at))}</time>
        </div>
      </header>
      <div class="moment-content">
        <p>${escapeHtml(item.content || "")}</p>
      </div>
      ${imageUrls.length ? `<div class="moment-gallery" data-count="${imageUrls.length}">${imageUrls.map((url, index) => (
        `<img class="moment-image" src="${escapeHtml(url)}" alt="说说配图 ${index + 1}" loading="lazy">`
      )).join("")}</div>` : ""}
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
  const friends = items.filter((item) => item.type === "friend");
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
  if (!list && !resourceBoard && !archiveBoard && !friendsBoard && pageType !== "home") return;

  try {
    const response = await fetch("/api/content-items");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return;
    const allItems = result.items || [];
    updateHomeStats(allItems);
    if (resourceBoard) {
      renderResources(allItems.filter((item) => item.type === "resource"));
      return;
    }
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
    if (items.length) {
      const staticResourceCard = pageType === "articles" ? list.querySelector(".resource-entry")?.outerHTML || "" : "";
      list.innerHTML = `${staticResourceCard}${items.map((item) => renderContentItem(item, pageType)).join("")}`;
    }
  } catch {
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
    if (askCount) askCount.textContent = formatCount(items.length);
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

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem(themeKey, nextTheme);
  applyTheme(nextTheme);
});

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

function initSimpleMusicPlayer() {
  if (!musicPlayerRoot) return;

  const demoUrl = createDemoToneUrl();
  const playlist = window.GALOIS37_MUSIC_PLAYLIST || [
    {
      title: "夜の向日葵",
      artist: "松本文紀",
      cover: "assets/music/yoru-no-himawari-cover.jpg",
      src: "assets/music/yoru-no-himawari.mp3",
      lyrics: []
    }
  ];

  const audio = new Audio();
  audio.preload = "metadata";
  let currentIndex = 0;

  const cover = musicPlayerRoot.querySelector("[data-music-cover]");
  const title = musicPlayerRoot.querySelector("[data-music-title]");
  const artist = musicPlayerRoot.querySelector("[data-music-artist]");
  const lyric = musicPlayerRoot.querySelector("[data-music-lyric]");
  const current = musicPlayerRoot.querySelector("[data-music-current]");
  const duration = musicPlayerRoot.querySelector("[data-music-duration]");
  const progress = musicPlayerRoot.querySelector("[data-music-progress]");
  const toggle = musicPlayerRoot.querySelector("[data-music-toggle]");
  const icon = musicPlayerRoot.querySelector("[data-music-icon]");
  const prev = musicPlayerRoot.querySelector("[data-music-prev]");
  const next = musicPlayerRoot.querySelector("[data-music-next]");

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const activeLyric = (song) => {
    if (!song.lyrics?.length) return song.note || "";
    const item = [...song.lyrics].reverse().find((line) => audio.currentTime >= line.time);
    return item?.text || song.lyrics[0].text;
  };

  const setLyric = (value) => {
    if (!lyric) return;
    const text = String(value || "").trim();
    lyric.textContent = text;
    lyric.hidden = !text;
  };

  const renderSong = () => {
    const song = playlist[currentIndex];
    if (!song) return;
    title.textContent = song.title || "未命名音轨";
    artist.textContent = song.artist || "未知作者";
    setLyric(song.lyrics?.[0]?.text || song.note || "");
    if (cover) cover.src = song.cover || "assets/avatar.jpg";
    audio.src = song.src || demoUrl;
    audio.load();
    progress.value = "0";
    current.textContent = "00:00";
    duration.textContent = "00:00";
  };

  const updatePlayingState = () => {
    const isPlaying = !audio.paused;
    musicPlayerRoot.classList.toggle("is-playing", isPlaying);
    icon.textContent = isPlaying ? "Ⅱ" : "▶";
  };

  const playCurrent = async () => {
    try {
      await audio.play();
      updatePlayingState();
    } catch {
      setLyric("浏览器阻止了播放，请再点一次播放按钮。");
      updatePlayingState();
    }
  };

  toggle?.addEventListener("click", () => {
    if (audio.paused) playCurrent();
    else {
      audio.pause();
      updatePlayingState();
    }
  });

  prev?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    renderSong();
    playCurrent();
  });

  next?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    renderSong();
    playCurrent();
  });

  progress?.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    current.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
    progress.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : "0";
    setLyric(activeLyric(playlist[currentIndex]));
  });

  audio.addEventListener("ended", () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    renderSong();
    playCurrent();
  });

  audio.addEventListener("error", () => {
    setLyric("音频路径读取失败，请检查 assets/music/ 中的文件名。");
    updatePlayingState();
  });

  renderSong();
}

initSimpleMusicPlayer();

authModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authModeButton));
});

if (messageForm) {
  messageForm.addEventListener("submit", async (event) => {
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
}

userForm?.addEventListener("submit", async (event) => {
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

logoutButton?.addEventListener("click", async () => {
  localStorage.removeItem(userTokenKey);
  setUser(null);
  await loadPublicMessages();
});

void (async () => {
  await loadSettings();
  await loadContentItems();
  await loadMomentsPage();
  await loadHomeStats();
  await loadCurrentUser();
  await loadPublicMessages();
})();

if (navigator.sendBeacon) {
  const blob = new Blob([JSON.stringify({ path: location.pathname })], { type: "application/json" });
  navigator.sendBeacon("/api/stats", blob);
} else {
  fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: location.pathname }),
  }).catch(() => {});
}
