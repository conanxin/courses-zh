# How to Speak - 中文学习站使用指南

> MIT OCW《How to Speak》本地学习播放器

---

## 快速启动

### 方法 1：Python HTTP 服务器（推荐）

在 WSL 终端中执行：

```bash
cd /mnt/d/home/conanxin/workspace/how-to-speak-zh
python3 scripts/run_phase4_player_site.py
```

然后浏览器会自动打开：
**http://localhost:8787/05_player_site/**

### 方法 2：直接打开 HTML

如果 Python 不可用，直接用浏览器打开：

```
05_player_site/index.html
```

注意：直接打开文件可能无法加载视频字幕，建议使用方法 1。

---

## 功能介绍

### 🎬 视频播放器
- 播放原始 MIT 视频
- 切换字幕：中文 / 双语 / 关闭
- 点击章节直接跳转

### 📚 章节导航
- 10 个章节，带时间范围
- 点击跳转到对应视频位置

### 📄 讲稿
- **中文讲稿**：完整翻译，可搜索
- **双语讲稿**：中英对照，逐段学习

### 📖 学习讲义
- 11 篇讲义，含核心概念、详细内容、实践建议、练习题

### 🃏 学习卡片
- 40 张卡片，点击显示答案
- 涵盖核心概念、术语、技巧

### ✏️ 练习模板
- 6 个练习模板
- 从开场到结束全流程

### 📚 术语表
- 中英术语对照
- 统一翻译标准

### 🔍 审校工作台
- 自动检测翻译问题
- 174 条待审校项（主要为长行提示和英中相同文本）

---

## 字幕切换

在播放器下方有三个按钮：
- **🇨🇳 中文**：只显示中文字幕
- **🔄 双语**：显示英文 + 中文两行
- **❌ 关闭**：关闭字幕

---

## 章节跳转

点击任意章节卡片，视频会自动跳转到对应时间并播放。

---

## 文件结构

```
05_player_site/
├── index.html              # 主页（播放器 + 章节导航）
├── pages/
│   ├── transcript.html     # 中文讲稿
│   ├── transcript-bilingual.html  # 双语讲稿
│   ├── notes.html         # 讲义索引
│   ├── cards.html         # 学习卡片
│   ├── practice.html      # 练习模板
│   ├── glossary.html      # 术语表
│   └── review.html        # 审校工作台
├── assets/
│   ├── css/style.css      # 样式
│   ├── js/app.js          # 脚本
│   └── data/
│       ├── chapters.json          # 章节数据
│       ├── subtitles_zh.vtt      # 中文字幕
│       ├── subtitles_bilingual.vtt  # 双语字幕
│       └── review_queue.json      # 审校队列
└── README.md              # 本文件
```

---

## 更新字幕

如需更新字幕，修改 `02_zh/subtitles/` 下的 SRT 文件，然后重新运行：

```bash
cd /mnt/d/home/conanxin/workspace/how-to-speak-zh
python3 scripts/phase4_prepare_data.py
```

---

## 离线使用

本站完全离线可用，无需网络连接。所有资源均为本地文件。

---

**MIT OCW RES.TLL-005 How to Speak | 中文学习版**
