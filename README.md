# EnHub Web - 英语文章数字化归档工具 🚀

EnHub Web 是一个专为个人设计的隐私保护工具。它可以利用 AI 技术将图片中的英语文章提取出来，自动转换成精美的 HTML 阅读页面，并一键归档到你的个人 GitHub 仓库中。

---

## 📖 核心功能

- **图片转 HTML**：上传英语文章图片，AI 自动识别并生成带样式的阅读页面。
- **实时预览与编辑**：左侧代码编辑，右侧实时预览，支持手动微调。
- **GitHub 自动化归档**：按照年份和编号，自动将文章存入 GitHub。
- **隐私保障**：所有 API 密钥均保存在浏览器本地，不经过任何第三方服务器。

---

## 🛠️ 准备工作（小白必看）

在使用之前，你需要准备两个关键的 "Token"（通行证）。

### 1. 获取 GitHub Token
这个 Token 用于授权应用将文件上传到你的 GitHub 仓库。

- **获取步骤**：
  1. 登录 GitHub，点击右上角头像 -> **Settings**。
  2. 在左侧菜单最下方点击 **Developer settings**。
  3. 选择 **Personal access tokens** -> **Tokens (classic)**。
  4. 点击 **Generate new token (classic)**。
  5. **Note** 填入 `EnHub-Web`。
  6. **重要：权限勾选**：
     - 勾选 `repo` (Full control of private repositories) —— 这是必须的，否则无法上传。
  7. 点击页面最下方的 **Generate token**。
  8. **复制生成的 Token 并保存**（它只会出现一次！）。

### 2. 获取 AI API Key (OpenRouter / 阿里云百炼)
本项目默认支持 OpenRouter 或 兼容 OpenAI 格式的接口（如阿里云百炼）。

- **OpenRouter 获取步骤**：
  1. 访问 [OpenRouter.ai](https://openrouter.ai/)。
  2. 注册/登录后，进入 **Keys** 页面。
  3. 点击 **Create Key**，复制生成的密钥。
- **阿里云百炼 获取步骤**：
  1. 登录 [阿里云百炼控制台](https://bailian.console.aliyun.com/)。
  2. 开通模型服务（如 Qwen-VL-Plus 等视觉模型）。
  3. 在左侧菜单找到 **API-KEY**，创建并获取密钥。

---

## 🚀 整体使用流程

1. **初次配置**：
   - 打开应用，点击顶部的 **设置（齿轮图标）**。
   - 输入你的 **GitHub Token**、**仓库名**（格式：`用户名/仓库名`，例如 `liu-sunset/enhub`）。
   - 输入你的 **AI API Key**。
   - 保存配置（数据将存在你的浏览器中）。

2. **上传图片**：
   - 在首页拖入或选择一张或多张英语文章图片。
   - 点击“开始识别”，等待 AI 处理。

3. **预览与修改**：
   - 识别完成后，你会进入编辑页面。
   - 你可以在左侧修改 HTML 代码（比如修正错别字），右侧会即时看到排版效果。

4. **保存归档**：
   - 输入文章所属的 **年份**（如 `2024`）和 **文章 ID**（如 `reading-01`）。
   - 点击 **Upload to GitHub**，应用会自动在你的仓库中创建路径并保存文件。

---

## 💻 本地运行指南

如果你想在本地开发或运行：

1. **安装环境**：确保你安装了 [Node.js](https://nodejs.org/)。
2. **克隆项目**：
   ```bash
   git clone https://github.com/liu-sunset/enhub.git
   cd enhub
   ```
3. **安装依赖**：
   ```bash
   npm install
   ```
4. **启动项目**：
   ```bash
   npm run dev
   ```
5. **访问**：在浏览器打开 `http://localhost:5173`。

---

## 📄 许可证
MIT License. 自由使用，注意保护好你的 Token 安全！
