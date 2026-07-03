// How to Speak - Chinese Learning Player App

const CONFIG = {
  videoPath: 'https://archive.org/download/mithowtospeak/MIT_How_To_Speak_IAP_2018_300k.mp4',
  subtitles: {
    zh: 'assets/data/subtitles_zh.vtt',
    bilingual: 'assets/data/subtitles_bilingual.vtt'
  }
};

let chapters = [];
let reviewQueue = [];
let currentSubtitleMode = 'zh';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadChapters();
  await loadReviewQueue();
  renderChapterList();
  setupVideoPlayer();
  setupControls();
  renderReviewQueue();
});

async function loadChapters() {
  try {
    const resp = await fetch('assets/data/chapters.json');
    chapters = await resp.json();
  } catch (e) {
    console.error('Failed to load chapters:', e);
  }
}

async function loadReviewQueue() {
  try {
    const resp = await fetch('assets/data/review_queue.json');
    reviewQueue = await resp.json();
  } catch (e) {
    console.error('Failed to load review queue:', e);
  }
}

function renderChapterList() {
  const container = document.getElementById('chapter-list');
  if (!container) return;
  
  container.innerHTML = chapters.map(ch => `
    <div class="chapter-item" onclick="jumpToChapter(${ch.start_seconds})">
      <div class="num">${String(ch.index).padStart(2, '0')}</div>
      <div class="info">
        <div class="title-zh">${ch.title_zh}</div>
        <div class="title-en">${ch.title_en}</div>
      </div>
      <div class="time">${formatTime(ch.start_seconds)} - ${formatTime(ch.end_seconds)}</div>
    </div>
  `).join('');
}

function setupVideoPlayer() {
  const video = document.getElementById('video-player');
  if (!video) return;
  
  // Set video source
  video.src = CONFIG.videoPath;
  
  // Add subtitle tracks
  const trackZh = document.createElement('track');
  trackZh.src = CONFIG.subtitles.zh;
  trackZh.kind = 'subtitles';
  trackZh.srclang = 'zh-CN';
  trackZh.label = '中文';
  trackZh.default = true;
  video.appendChild(trackZh);
  
  const trackBil = document.createElement('track');
  trackBil.src = CONFIG.subtitles.bilingual;
  trackBil.kind = 'subtitles';
  trackBil.srclang = 'zh-bil';
  trackBil.label = '双语';
  video.appendChild(trackBil);
}

function setupControls() {
  const btnZh = document.getElementById('btn-subtitle-zh');
  const btnBil = document.getElementById('btn-subtitle-bil');
  const btnOff = document.getElementById('btn-subtitle-off');
  const video = document.getElementById('video-player');
  
  if (!btnZh || !video) return;
  
  btnZh.addEventListener('click', () => {
    setSubtitleMode('zh');
    updateActiveButton(btnZh, [btnBil, btnOff]);
  });
  
  btnBil.addEventListener('click', () => {
    setSubtitleMode('bilingual');
    updateActiveButton(btnBil, [btnZh, btnOff]);
  });
  
  btnOff.addEventListener('click', () => {
    setSubtitleMode('off');
    updateActiveButton(btnOff, [btnZh, btnBil]);
  });
}

function setSubtitleMode(mode) {
  const video = document.getElementById('video-player');
  if (!video) return;
  
  const tracks = video.textTracks;
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].mode = 'disabled';
  }
  
  if (mode === 'zh' && tracks[0]) tracks[0].mode = 'showing';
  if (mode === 'bilingual' && tracks[1]) tracks[1].mode = 'showing';
  
  currentSubtitleMode = mode;
}

function updateActiveButton(active, others) {
  active.classList.add('active');
  others.forEach(b => b.classList.remove('active'));
}

function jumpToChapter(seconds) {
  const video = document.getElementById('video-player');
  if (video) {
    video.currentTime = seconds;
    video.play();
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderReviewQueue() {
  const container = document.getElementById('review-list');
  if (!container) return;
  
  const stats = document.getElementById('review-stats');
  if (stats) stats.innerHTML = `共 ${reviewQueue.length} 条待审校`;
  
  if (reviewQueue.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">✅ 未发现明显问题，全部通过！</p>';
    return;
  }
  
  container.innerHTML = reviewQueue.slice(0, 50).map(item => `
    <div class="review-item" data-index="${item.index}">
      <div class="header">
        <span class="index">#${item.index}</span>
        <span class="type">${item.type}</span>
        <span style="color:#999; font-size:0.85em;">${item.timestamp}</span>
      </div>
      <div class="text-en">${escapeHtml(item.text_en)}</div>
      <div class="text-zh">${escapeHtml(item.text_zh)}</div>
      <div class="issue">⚠️ ${item.issue}</div>
      <div class="actions">
        <button onclick="markReviewed(${item.index}, 'ok')">✅ 没问题</button>
        <button onclick="markReviewed(${item.index}, 'edit')">✏️ 需修改</button>
        <button onclick="jumpToTime('${item.timestamp}')">⏱️ 跳转</button>
      </div>
    </div>
  `).join('');
}

function jumpToTime(timestamp) {
  const video = document.getElementById('video-player');
  if (!video) return;
  
  const parts = timestamp.split(':');
  const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2].replace(',', '.'));
  video.currentTime = seconds;
  video.play();
  
  // Scroll to video
  document.querySelector('.player-section')?.scrollIntoView({ behavior: 'smooth' });
}

function markReviewed(index, status) {
  const item = document.querySelector(`.review-item[data-index="${index}"]`);
  if (item) {
    item.style.opacity = '0.5';
    item.style.borderLeftColor = status === 'ok' ? '#4caf50' : '#ff9800';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Card toggle
function toggleCard(el) {
  const answer = el.parentElement.querySelector('.answer');
  if (answer) {
    answer.classList.toggle('show');
    el.textContent = answer.classList.contains('show') ? '隐藏答案' : '显示答案';
  }
}

// Search in transcript
function searchTranscript() {
  const query = document.getElementById('transcript-search')?.value.toLowerCase();
  if (!query) return;
  
  const blocks = document.querySelectorAll('.transcript-block');
  blocks.forEach(block => {
    const text = block.textContent.toLowerCase();
    block.style.display = text.includes(query) ? 'block' : 'none';
  });
}
