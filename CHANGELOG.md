# 变更日志

## [未发布]

### 新增
- ✨ 关注功能：支持关注感兴趣的公众号
  - 左侧边栏显示关注列表
  - 支持添加、删除、搜索关注
  - 支持导入/导出关注数据（JSON格式）
  - 基于 localStorage 的可靠数据存储
  - 响应式设计，适配不同屏幕尺寸

### 技术改进
- 🔧 优化数据存储方案：从 IndexedDB 迁移到 localStorage
- 🔧 新增 `useFollows` composable 统一管理关注状态
- 🔧 新增测试页面 (`/test-follows`) 用于功能验证
- 🔧 改进错误处理和用户反馈

### 文件变更
- 新增 `composables/useFollows.ts` - 关注功能核心逻辑
- 新增 `pages/test-follows.vue` - 功能测试页面
- 更新 `pages/index.vue` - 集成关注侧边栏
- 更新 `docs/follow-feature-plan.md` - 开发计划文档
- 删除 IndexedDB 相关文件（`store/follows.ts`, `utils/db-fix.ts` 等）

### 修复
- 🐛 解决服务重启后 IndexedDB 数据丢失问题
- 🐛 修复关注列表在首页不显示的问题
- 🐛 优化类型定义，解决 TypeScript 错误

## [历史版本]

### v1.0.0
- 🎉 初始版本发布
- ✨ 基础的文章搜索和导出功能
- ✨ 支持多种导出格式（HTML、JSON、Excel、TXT）
- ✨ 文章过滤和缓存功能
- ✨ 评论和阅读量数据导出 