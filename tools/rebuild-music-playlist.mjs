import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const PLAYLIST_URL = "https://music.163.com/m/playlist?id=18026937829&creatorId=9002935056";
const DB_NAME = "galois37_site";
const SETTING_KEY = "music.playlist";

const siteRoot = process.cwd();
const outputDir = path.join(siteRoot, ".wrangler");
const wranglerBin = path.join(siteRoot, "..", "..", "work", "tools", "wrangler", "node_modules", "wrangler", "bin", "wrangler.js");
const neteaseModulePath = path.join(siteRoot, "functions", "api", "music", "netease.js");

const manualAudioMatches = new Map([
  ["Ref:rain", "Refrain.mp3"],
  ["DESIR", "Arte Refact - DESIR.mp3"],
  ["勾指起誓", "泠鸢yousa - 勾指起誓.mp3"],
  ["美しい音色で世界が鳴った", "松本文紀 - 美しい音色で世界が鳴った.mp3"],
  ["夢の歩みを見上げて", "松本文紀 - 夢の歩みを見上げて.mp3"],
  ["After All ～綴る想い～", "After All ～綴る想い～.mp3"],
  ["夏の大三角", "natsu-no-daisankaku.mp3"],
  ["夜の向日葵", "yoru-no-himawari.mp3"],
]);

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\([^)]*\)|（[^）]*）|\[[^\]]*\]|【[^】]*】/g, "")
    .replace(/feat\.?|ft\.?|piano ver\.?|うぃんぐ/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function parseJsonFromWrangler(stdout) {
  const text = String(stdout || "").trim();
  const indexes = [text.indexOf("["), text.indexOf("{")].filter((index) => index >= 0);
  if (!indexes.length) throw new Error(`Wrangler did not return JSON:\n${text}`);
  return JSON.parse(text.slice(Math.min(...indexes)));
}

function runWrangler(args) {
  const stdout = execFileSync(process.execPath, [wranglerBin, ...args], {
    cwd: siteRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return stdout;
}

function selectCurrentPlaylist() {
  const stdout = runWrangler([
    "d1",
    "execute",
    DB_NAME,
    "--remote",
    "--json",
    "--command",
    `SELECT value FROM site_settings WHERE key='${SETTING_KEY}';`,
  ]);
  const data = parseJsonFromWrangler(stdout);
  const value = data?.[0]?.results?.[0]?.value || data?.results?.[0]?.value || "[]";
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Current music.playlist is not an array.");
  return parsed;
}

async function fetchPlaylistFromNetease() {
  const { onRequestGet } = await import(`file:///${neteaseModulePath.replaceAll("\\", "/")}`);
  const token = "local-music-rebuild-token";
  const env = {
    ADMIN_TOKEN_HASH: createHash("sha256").update(token).digest("hex"),
  };
  const request = new Request(
    `https://local/api/music/netease?playlist=${encodeURIComponent(PLAYLIST_URL)}&limit=100&lyrics=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const response = await onRequestGet({ request, env });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `NetEase import failed with ${response.status}.`);
  }
  if (!Array.isArray(payload.items) || payload.items.length < 3) {
    throw new Error("NetEase playlist returned too few items.");
  }
  return payload.items;
}

function listAudioFiles() {
  return readdirSync(path.join(siteRoot, "assets", "music"))
    .filter((name) => /\.mp3$/i.test(name))
    .map((name) => ({
      name,
      src: `assets/music/${name}`,
      key: normalize(name.replace(/\.mp3$/i, "")),
    }));
}

function matchAudio(item, audioFiles) {
  const manual = manualAudioMatches.get(item.title);
  if (manual) {
    const found = audioFiles.find((file) => file.name === manual);
    if (found) return found.src;
  }

  const titleKey = normalize(item.title);
  const artistTitleKey = normalize(`${item.artist} ${item.title}`);
  const found = audioFiles.find((file) =>
    file.key === titleKey ||
    file.key === artistTitleKey ||
    titleKey.includes(file.key) ||
    file.key.includes(titleKey)
  );
  return found?.src || "";
}

function playlistItem(item, audioFiles) {
  const src = matchAudio(item, audioFiles);
  return {
    ...item,
    id: item.id || `netease-${item.sourceId}`,
    src,
    status: src ? "visible" : "draft",
    note: item.lyrics ? "网易云导入，已匹配本地音频与歌词。" : "网易云导入，已匹配本地音频；暂无歌词。",
  };
}

function buildSql(value) {
  const escaped = JSON.stringify(value).replaceAll("'", "''");
  return `INSERT INTO site_settings (key, value, updated_at)
VALUES ('${SETTING_KEY}', '${escaped}', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP;
`;
}

const current = selectCurrentPlaylist();
const preserved = current.slice(0, 2);
const preservedKeys = new Set(preserved.flatMap((item) => [String(item.sourceId || ""), normalize(item.title)]));
const imported = await fetchPlaylistFromNetease();
const audioFiles = listAudioFiles();

const freshItems = imported
  .filter((item) => !preservedKeys.has(String(item.sourceId || "")) && !preservedKeys.has(normalize(item.title)))
  .map((item) => playlistItem(item, audioFiles));

const missing = freshItems.filter((item) => !item.src);
if (missing.length) {
  throw new Error(`Missing local audio match for: ${missing.map((item) => `${item.title}(${item.sourceId})`).join(", ")}`);
}

const rebuilt = [...preserved, ...freshItems];
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "music-playlist-rebuilt.json"), JSON.stringify(rebuilt, null, 2), "utf8");
writeFileSync(path.join(outputDir, "music-playlist-update.sql"), buildSql(rebuilt), "utf8");

console.log(JSON.stringify({
  preserved: preserved.map((item) => item.title),
  imported: freshItems.length,
  total: rebuilt.length,
  sql: path.join(outputDir, "music-playlist-update.sql"),
  json: path.join(outputDir, "music-playlist-rebuilt.json"),
}, null, 2));
