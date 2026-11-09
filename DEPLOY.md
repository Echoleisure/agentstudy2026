# GitHub Pages 部署步骤（Echoleisure/agentstudy2026）

## 方法 A：通过网页上传（首次最容易）

1. 访问 https://github.com/Echoleisure/agentstudy2026 ，确保登录自己的 GitHub 账号。
2. 如仓库已有文件，请先看清 README/分支，**不要盲目覆盖原有文件**。
3. 解压本站 ZIP 包。进入仓库的 **Code** 页面，在当前 `main` 分支选择 **Add file → Upload files**。
4. 上传解压后的所有**文件与目录**到仓库根目录，特别包括 `index.html`、`data.js`、`app.js`、`styles.css`、`assets/`、`scripts/`。
5. 在页面底部提交更改（Commit changes）。
6. 打开 **Settings → Pages → Build and deployment**，Source 选择 **Deploy from a branch**，Branch `main`，Folder `/(root)`，保存。
7. 在仓库的 **Actions** 查看 `pages build and deployment` 是否成功；Settings → Pages 会显示线上地址。
8. 打开 https://echoleisure.github.io/agentstudy2026/ 检查首页、课程、面试题、指标和下载链接。

若仓库默认分支不是 `main`，在 Pages 中选择仓库真实默认分支。若上传网页界面无法保留目录，建议用方法 B。

## 方法 B：Mac 终端（适合日后更新）

先确保本机已登录 GitHub（SSH 或 Git Credential Manager），然后在一个新目录操作：

```bash
git clone https://github.com/Echoleisure/agentstudy2026.git
cd agentstudy2026
# 把下载的静态站 ZIP 解压后，复制其中全部文件到这个目录，避免覆盖原有重要文件。
git status
git add index.html app.js data.js styles.css assets scripts README.md DEPLOY.md .nojekyll .gitignore
git commit -m "Add Agent QA study website"
git push origin HEAD
```

**不要使用 `git push --force`**；如果仓库已经包含其他项目，请先备份或使用独立分支/目录集成。

## 排查

- **404**：先看 Settings → Pages 的状态，确认上传的入口文件是根目录 `index.html`，发布分支/目录配置正确，Actions 运行成功。
- **CSS/JS 不加载**：确保 `styles.css`、`app.js`、`data.js` 与 `index.html` 同目录；本站使用相对路径支持 `/agentstudy2026/`。
- **内容无法搜索**：确认 `data.js` 成功上传；打开浏览器开发者工具 Console 看是否有错误。
- **本机记录不显示**：LocalStorage 按网站域名和浏览器独立保存；需要从旧浏览器使用“我的笔记 → 导出”再到新浏览器“导入”。
- **隐私**：Pages 是公开发布；永远不要提交密码、API Key、生产日志、租户信息、内部资料和个人笔记 JSON。

官方参考：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
