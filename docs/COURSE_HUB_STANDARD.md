# 中文课程集合项目规范

## 目录约定

每门课程放在：

```text
courses/<course-slug>/
```

每门课程至少包含：

```text
courses/<course-slug>/
├─ index.html
├─ course_manifest.json
├─ resources.html
├─ assets/
├─ pages/
└─ resources/
```

## 必需文件

- `index.html`：课程入口页
- `course_manifest.json`：课程元数据
- `resources.html`：资源索引
- `pages/review.html`：审校页，建议保留
- 字幕 VTT：推荐放在 `assets/data/` 或 `assets/subtitles/`
- 中文讲稿、双语讲稿、讲义、卡片、练习：推荐放在 `resources/`

## 根目录文件

- `index.html`：课程集合首页
- `courses/catalog.json`：课程目录数据
- `sitemap.xml`
- `robots.txt`
- `.nojekyll`
- `NOTICE.md`

## 新增课程原则

1. 不上传大视频文件，优先引用官方公开视频地址。
2. 不把原始下载包放入 Pages。
3. 每门课程必须有独立 slug。
4. 更新 `courses/catalog.json`。
5. 运行 `tools/validate_hub.py`。
6. 再提交并推送 `gh-pages`。
