# 如何新增一门课程

## 1. 准备课程目录

将新课程构建到：

```text
courses/<course-slug>/
```

例如：

```text
courses/example-course/
```

## 2. 最小必需结构

```text
courses/example-course/
├─ index.html
├─ course_manifest.json
├─ resources.html
├─ assets/
├─ pages/
└─ resources/
```

## 3. 更新 catalog

在 `courses/catalog.json` 中添加一条课程记录。

至少包含：

```json
{
  "id": "example-course",
  "slug": "example-course",
  "title_zh": "示例课程",
  "title_en": "Example Course",
  "description": "课程简介",
  "href": "./courses/example-course/",
  "manifest": "./courses/example-course/course_manifest.json",
  "status": "v1.0"
}
```

## 4. 校验

```shell
python3 tools/validate_hub.py
```

## 5. 发布

```shell
cd 06_github_pages_hub
git add .
git commit -m "Add example course"
git push origin gh-pages:gh-pages
```
