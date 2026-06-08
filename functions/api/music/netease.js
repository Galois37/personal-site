import { json, requireAdmin } from "../../_utils.js";

function extractMusicTarget(value, fallbackKind = "playlist") {
  const source = String(value || "").trim();
  if (/^\d{4,}$/.test(source)) return { id: source, kind: fallbackKind };

  const lowerSource = source.toLowerCase();
  let kind = lowerSource.includes("song") ? "song" : fallbackKind;

  try {
    const url = new URL(source);
    const hash = decodeURIComponent(url.hash || "");
    const pathAndHash = `${url.pathname} ${hash}`.toLowerCase();
    if (url.searchParams.get("type") === "song" || pathAndHash.includes("song")) kind = "song";
    if (url.searchParams.get("type") === "playlist" || pathAndHash.includes("playlist")) kind = "playlist";

    const hashId = hash.match(/id=(\d{4,})/)?.[1] || hash.match(/(?:song|playlist)\/(\d{4,})/)?.[1];
    const id = url.searchParams.get("id") || hashId;
    if (id && /^\d+$/.test(id)) return { id, kind };
  } catch {
  }

  const typedMatch = lowerSource.match(/(song|playlist)[^0-9]*(\d{4,})/);
  if (typedMatch) return { id: typedMatch[2], kind: typedMatch[1] };

  const match = source.match(/id=(\d{4,})/);
  return match ? { id: match[1], kind } : { id: "", kind };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Galois37Site/1.0",
      "Referer": "https://music.163.com/",
      "Accept": "application/json,text/plain,*/*",
    },
  });
  if (!response.ok) throw new Error(`网易云请求失败：${response.status}`);
  return response.json();
}

function artistName(track) {
  const artists = track.ar || track.artists || [];
  return artists.map((artist) => artist.name).filter(Boolean).join(" / ") || "未知作者";
}

function coverUrl(track) {
  return track.al?.picUrl || track.album?.picUrl || "";
}

function normalizeSong(track, index = 0, note = "来自网易云，音频请自行填入本地 mp3 路径。") {
  return {
    id: `netease-${track.id || Date.now()}-${index}`,
    title: String(track.name || "未命名音轨"),
    artist: artistName(track),
    cover: coverUrl(track),
    src: "",
    note,
    lyrics: "",
    source: "netease",
    sourceId: String(track.id || ""),
    status: "draft",
  };
}

async function fetchLyric(songId) {
  if (!songId) return "";
  try {
    const data = await fetchJson(`https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`);
    return String(data?.lrc?.lyric || "").trim();
  } catch {
    return "";
  }
}

async function fetchSongDetail(songId) {
  const endpoints = [
    `https://music.163.com/api/song/detail/?id=${songId}&ids=%5B${songId}%5D`,
    `https://music.163.com/api/v3/song/detail?c=${encodeURIComponent(JSON.stringify([{ id: Number(songId) }]))}`,
  ];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const data = await fetchJson(endpoint);
      const song = data?.songs?.[0];
      if (song) return song;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("没有从网易云读取到单曲信息。");
}

async function buildSongResponse(songId, includeLyrics) {
  const song = await fetchSongDetail(songId);
  const item = normalizeSong(song, 0, "来自网易云单曲，音频请自行填入本地 mp3 路径。");
  if (includeLyrics) item.lyrics = await fetchLyric(songId);

  return json({
    ok: true,
    playlist: {
      id: songId,
      name: `${item.title} - ${item.artist}`,
      cover: item.cover,
      trackCount: 1,
      type: "song",
    },
    items: [item],
    warning: "网易云音频直链不稳定，本导入只作为歌曲信息、封面和歌词辅助；请自行补充 mp3 路径后再设为加入歌单。",
  });
}

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const url = new URL(request.url);
  const rawKind = url.searchParams.get("type") === "song" ? "song" : "playlist";
  const target = url.searchParams.get("song")
    ? extractMusicTarget(url.searchParams.get("song"), "song")
    : extractMusicTarget(url.searchParams.get("playlist") || url.searchParams.get("id"), rawKind);
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 100);
  const includeLyrics = url.searchParams.get("lyrics") !== "0";

  if (!target.id) return json({ error: "请提供网易云歌单/单曲链接或 ID。" }, 400);

  if (target.kind === "song") {
    try {
      return await buildSongResponse(target.id, includeLyrics);
    } catch (error) {
      return json({
        error: error?.message || "没有从网易云读取到单曲信息。可能是接口限制或网络暂时不可用。",
      }, 502);
    }
  }

  const playlistId = target.id;

  const endpoints = [
    `https://music.163.com/api/v6/playlist/detail?id=${playlistId}&n=${limit}`,
    `https://music.163.com/api/playlist/detail?id=${playlistId}&n=${limit}`,
  ];

  let data = null;
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      data = await fetchJson(endpoint);
      if (data?.playlist || data?.result) break;
    } catch (error) {
      lastError = error;
    }
  }

  const playlist = data?.playlist || data?.result;
  const tracks = (playlist?.tracks || []).slice(0, limit);
  if (!playlist || !tracks.length) {
    return json({
      error: lastError?.message || "没有从网易云读取到歌单曲目。可能是歌单非公开、接口限制或网络暂时不可用。",
    }, 502);
  }

  const items = tracks.map((track, index) => normalizeSong(track, index, "来自网易云歌单，音频请自行填入本地 mp3 路径。"));

  if (includeLyrics) {
    const lyricResults = await Promise.allSettled(
      items.slice(0, 30).map((item) => fetchLyric(item.sourceId))
    );
    lyricResults.forEach((result, index) => {
      if (result.status === "fulfilled") items[index].lyrics = result.value;
    });
  }

  return json({
    ok: true,
    playlist: {
      id: playlistId,
      name: playlist.name || `网易云歌单 ${playlistId}`,
      cover: playlist.coverImgUrl || "",
      trackCount: playlist.trackCount || tracks.length,
    },
    items,
    warning: "网易云音频直链不稳定，本导入只作为歌曲信息、封面和歌词辅助；请自行补充 mp3 路径后再设为加入歌单。",
  });
}
