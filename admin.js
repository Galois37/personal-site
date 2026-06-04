const loginForm = document.querySelector("[data-login-form]");
const settingsForm = document.querySelector("[data-settings-form]");
const contentForm = document.querySelector("[data-content-form]");
const friendForm = document.querySelector("[data-friend-form]");
const momentForm = document.querySelector("[data-moment-form]");
const loginPanel = document.querySelector("[data-admin-login]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const adminList = document.querySelector("[data-admin-list]");
const commentsList = document.querySelector("[data-comments-list]");
const contentList = document.querySelector("[data-content-list]");
const friendsList = document.querySelector("[data-friends-list]");
const momentsList = document.querySelector("[data-moments-list]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminViews = document.querySelectorAll("[data-admin-view]");
const deployButton = document.querySelector("[data-deploy-button]");
const deployStatus = document.querySelector("[data-deploy-status]");

const tokenStoreKey = "galois37_admin_token";
const userTokenKey = "galois37_user_token";
const themeKey = "galois37_theme";

const defaultSettings = {
  "site.name": "Galois37の完美算术教室",
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
};

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

function imageUrlWithVersion(url, version) {
  const normalized = String(url || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  const cacheKey = encodeURIComponent(String(version || Date.now()).replace(/\s+/g, "-"));
  return `${normalized}${normalized.includes("?") ? "&" : "?"}v=${cacheKey}`;
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
  fillSettingsForm(result.settings || {});
}

function renderContentItems(items) {
  if (!contentList) return;
  const contentItems = items.filter((item) => item.type !== "friend");
  if (!contentItems.length) {
    contentList.innerHTML = `<article class="glass-card admin-row"><strong>暂无内容条目</strong><p>可以先导入一条笔记或项目。</p></article>`;
    return;
  }

  contentList.innerHTML = contentItems.map((item) => `
    <article class="glass-card admin-row content-edit-row" data-content-id="${item.id}">
      <div class="admin-row-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="admin-pill">${escapeHtml(item.type)}</span>
          <span class="admin-pill">${escapeHtml(item.status)}</span>
        </div>
        <time>${escapeHtml(item.created_at || "")}</time>
      </div>
      <label>
        类型
        <select name="type">
          <option value="note">笔记 note</option>
          <option value="resource">资源 resource</option>
          <option value="program">项目 program</option>
          <option value="article">文章 article</option>
        </select>
      </label>
      <label>标题<input type="text" name="title" value="${escapeHtml(item.title || "")}"></label>
      <label>说明<textarea name="description" rows="3">${escapeHtml(item.description || "")}</textarea></label>
      <label>链接<input type="url" name="url" value="${escapeHtml(item.url || "")}"></label>
      <label>标签<input type="text" name="label" value="${escapeHtml(item.label || "")}"></label>
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
  `).join("");

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
      ${momentPreviewImages(item.image_url, item.content)}
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
    loadMoments(),
  ]);
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

  try {
    await api("/api/content-items", { method: "POST", body: JSON.stringify(payload) });
    setStatus(contentForm, "内容条目已保存。");
    contentForm.reset();
    await loadContentItems();
  } catch (error) {
    setStatus(contentForm, error.message);
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

if (localStorage.getItem(tokenStoreKey) || localStorage.getItem(userTokenKey)) {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  loadAdminData().catch(() => {
    localStorage.removeItem(tokenStoreKey);
    loginPanel.hidden = false;
    dashboard.hidden = true;
  });
}
