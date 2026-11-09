# Agent QA Study 2026

一个轻量、**纯静态**的 Agent 平台测试开发学习网站，适合从 Python/pytest/Kubernetes 测试迁移到 Agent 平台测试。无后端、无用户登录、无构建工具。

- **课程**：MCP、Agent Runtime、Session/Context、RAG、Memory、Skill、Sandbox、Multi-Agent + asyncio、Agent E2E/Trace/Eval（共 9 个模块）
- **内容**：80 道带追问面试题、24 项质量与性能指标、30 个易混淆追问、功能测试案例及 Python 代码速查
- **交互**：站内搜索、课程完成标记、面试随机抽题、收藏、笔记、JSON 导入/导出、明暗主题
- **存储**：所有个人记录仅保存在浏览器 `localStorage`，不会上传到 GitHub，换设备请手动备份。

## 在线访问（发布后）

<https://echoleisure.github.io/agentstudy2026/>

此地址只有在仓库代码上传并且 GitHub Pages 发布成功后才能访问。

## 本地预览

```bash
python3 -m http.server 8000
```

打开 <http://localhost:8000/>。也可以直接打开 `index.html`，但建议用本地服务以模拟 GitHub Pages。

## 公开部署

在仓库 `Echoleisure/agentstudy2026` 的默认 `main` 分支根目录上传本项目文件，进入 **Settings → Pages → Build and deployment**：

1. **Source** 选 `Deploy from a branch`
2. **Branch** 选 `main`
3. **Folder** 选 `/(root)`
4. 保存，等待 GitHub Pages 构建完成
5. 在 <https://echoleisure.github.io/agentstudy2026/> 访问

详细步骤见 [DEPLOY.md](DEPLOY.md)。**仓库设为 Private 不代表 Pages 访问受限**；仅发布公开的通用教学数据。

## 维护内容

- `index.html` / `styles.css` / `app.js`：网站 UI 与交互
- `data.js`：由 Python 脚本生成的所有学习数据
- `scripts/content_source.py`：课程知识、问答与指标的原始内容
- `scripts/generate_data.py`：生成 `data.js`：`python3 scripts/generate_data.py`
- `assets/agent-qa-pytest-lab.zip`：匿名 pytest 示例工程

本仓库展示的是通用测试示例，**不是** AgentWorks 内部源码或内部部署架构。部分指标属于团队自定义口径。
