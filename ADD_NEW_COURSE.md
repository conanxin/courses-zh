# 如何添加新课程

## 目录结构

```
courses-zh/
├── courses/
│   ├── catalog.json          # 课程目录（自动更新）
│   ├── _template_course_manifest.json
│   └── <course-slug>/
│       ├── index.html        # 播放器/课程主页
│       ├── course_manifest.json
│       ├── resources.html    # 资源索引
│       ├── assets/           # 字幕、JS、CSS
│       ├── pages/            # 讲稿、卡片、练习
│       ├── resources/        # 原始学习材料
│       └── reports/          # 质量报告
```

## 步骤

1. 在本地完成课程的翻译和本地化（Phase 1-4）
2. 复制 `courses/_template_course_manifest.json` 并修改
3. 将课程目录放入 `courses/<course-slug>/`
4. 更新 `courses/catalog.json` 添加课程条目
5. 根 `index.html` 会自动从 `catalog.json` 生成课程卡片
6. 运行 `scripts/validate_course_hub.py` 校验完整性
7. 提交并 push `gh-pages` 分支

## 课程目录字段

```json
{
  "id": "course-slug",
  "slug": "course-slug",
  "title_zh": "课程中文名",
  "title_en": "Course Name",
  "description": "课程描述",
  "status": "v1.0",
  "tags": ["tag1", "tag2"],
  "href": "./courses/course-slug/"
}
```
