# 输电线路三维教学实验室 V1.0

一个可部署到 GitHub Pages 的静态网页学习项目，面向输电线路基础知识学习和三维结构观察。

## 功能
- 三维铁塔结构示意：旋转、缩放、平移、结构部位说明
- 导线弧垂三维形态模拟：调节档距和弧垂
- 输电线路基础知识卡片
- 弧垂简化公式教学计算器
- 基础知识选择题

## 本地运行
推荐使用 Visual Studio Code：
1. 打开项目文件夹。
2. 安装 VS Code 扩展 `Live Server`。
3. 右键 `index.html`，选择 `Open with Live Server`。

也可以在项目目录运行：
```bash
python -m http.server 8000
```
然后浏览器打开 `http://localhost:8000`。

> 本项目使用 Three.js CDN，因此首次加载三维模型需要联网。

## 部署到 GitHub Pages
1. 在 GitHub 新建一个 Public repository，例如 `transmission-line-lab`。
2. 将本项目全部文件上传到仓库根目录，确保 `index.html` 位于根目录。
3. 打开仓库 `Settings` → `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/ (root)`，点击 `Save`。
6. 等待部署完成，页面地址通常为 `https://你的用户名.github.io/transmission-line-lab/`。

## 重要安全边界
本项目中的铁塔模型是教学示意模型，不代表具体工程塔型；弧垂模拟和简化计算仅用于理解概念。不得将其作为正式设计、紧线、弧垂观测、施工验收或安全距离判定依据。实际工作必须遵循经批准的设计文件、施工方案、工作票、作业指导书和适用规程，并服从现场负责人指挥。

## 项目结构
```text
transmission-lab-v1/
├── index.html
├── styles.css
├── app.js
└── README.md
```
