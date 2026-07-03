
const CONFIG = {
 videoPath: "https://archive.org/download/mithowtospeak/MIT_How_To_Speak_IAP_2018_300k.mp4",
 archiveEmbed: "https://archive.org/embed/mithowtospeak",
 subtitles: {
  zh: "assets/data/subtitles_zh.vtt",
  bilingual: "assets/data/subtitles_bilingual.vtt"
 },
 chaptersPath: "assets/data/chapters.json"
};

let chapters = [];
let currentSubtitleMode = "zh";

document.addEventListener("DOMContentLoaded", async () => {
 await loadChapters();
 setupVideoPlayer();
 renderChapterList();
 setupSubtitleControls();
 setupVideoFallback();
});

async function loadChapters() {
 try {
  const resp = await fetch(CONFIG.chaptersPath);
  chapters = await resp.json();
 } catch (err) {
  console.error("Failed to load chapters", err);
  chapters = [];
 }
}

function setupVideoPlayer() {
 const video = document.getElementById("video-player");
 if (!video) return;
 const source = video.querySelector("source");
 if (source && !source.src) {
  source.src = CONFIG.videoPath;
 }
 if (!source && !video.src) {
  video.src = CONFIG.videoPath;
 }

 video.addEventListener("loadedmetadata", () => setSubtitleMode(currentSubtitleMode));

 const existingTracks = video.querySelectorAll("track");
 if (existingTracks.length === 0) {
  addTrack(video, CONFIG.subtitles.zh, "zh-CN", "中文", true);
  addTrack(video, CONFIG.subtitles.bilingual, "zh-Hans", "双语", false);
 }

 setTimeout(() => setSubtitleMode("zh"), 500);
}

function addTrack(video, src, srclang, label, isDefault) {
 const track = document.createElement("track");
 track.kind = "subtitles";
 track.src = src;
 track.srclang = srclang;
 track.label = label;
 if (isDefault) track.default = true;
 video.appendChild(track);
}

function setupVideoFallback() {
 const iframeBox = document.getElementById("archive-iframe-box");
 if (iframeBox && !iframeBox.dataset.loaded) {
  iframeBox.innerHTML = '<iframe src="' + CONFIG.archiveEmbed + '" allowfullscreen></iframe>';
  iframeBox.dataset.loaded = "true";
 }
}

function renderChapterList() {
 const container = document.getElementById("chapter-list");
 if (!container) return;

 container.innerHTML = chapters.map(ch => `
  <button type="button" class="chapter-card" data-start="${Number(ch.start_seconds || 0)}" data-index="${ch.index}">
   <span class="num">${String(ch.index).padStart(2, "0")}</span>
   <span>
    <span class="title">${escapeHtml(ch.title_zh || "")}</span><br>
    <span class="en">${escapeHtml(ch.title_en || "")}</span>
   </span>
   <span class="time">${escapeHtml(formatTime(ch.start_seconds))} - ${escapeHtml(formatTime(ch.end_seconds))}</span>
  </button>
 `).join("");

 container.querySelectorAll(".chapter-card").forEach(btn => {
  btn.addEventListener("click", () => {
   const seconds = Number(btn.dataset.start || 0);
   jumpToChapter(seconds, btn);
  });
 });
}

function jumpToChapter(seconds, btn) {
 const video = document.getElementById("video-player");
 if (!video) return;

 document.querySelector(".player-card")?.scrollIntoView({ behavior: "smooth", block: "start" });

 try {
  video.currentTime = seconds;
  video.focus();
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
   playPromise.catch(() => {});
  }
 } catch (err) {
  console.error("chapter jump failed", err);
 }

 document.querySelectorAll(".chapter-card").forEach(x => x.classList.remove("current"));
 if (btn) btn.classList.add("current");
}

function setupSubtitleControls() {
 const buttons = {
  zh: document.getElementById("btn-subtitle-zh"),
  bilingual: document.getElementById("btn-subtitle-bilingual"),
  off: document.getElementById("btn-subtitle-off")
 };

 if (buttons.zh) buttons.zh.addEventListener("click", () => setSubtitleMode("zh"));
 if (buttons.bilingual) buttons.bilingual.addEventListener("click", () => setSubtitleMode("bilingual"));
 if (buttons.off) buttons.off.addEventListener("click", () => setSubtitleMode("off"));
}

function setSubtitleMode(mode) {
 currentSubtitleMode = mode;
 const video = document.getElementById("video-player");
 if (!video) return;

 const tracks = video.textTracks || [];
 for (let i = 0; i < tracks.length; i++) {
  tracks[i].mode = "disabled";
 }

 if (mode === "zh" && tracks[0]) tracks[0].mode = "showing";
 if (mode === "bilingual" && tracks[1]) tracks[1].mode = "showing";

 document.querySelectorAll("[data-subtitle-button]").forEach(btn => btn.classList.remove("active"));
 const active = document.querySelector('[data-subtitle-button="' + mode + '"]');
 if (active) active.classList.add("active");
}

function formatTime(seconds) {
 seconds = Number(seconds || 0);
 const h = Math.floor(seconds / 3600);
 const m = Math.floor((seconds % 3600) / 60);
 const s = Math.floor(seconds % 60);
 if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
 return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function escapeHtml(text) {
 const div = document.createElement("div");
 div.textContent = text == null ? "" : String(text);
 return div.innerHTML;
}
