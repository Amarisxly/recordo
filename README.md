# Recordo（PWA 版）

拍照把笔记理顺排版，原文一字不改；生成可编辑的思维导图和段落总结。
这个文件夹是一个完整的 PWA：可以安装到手机主屏幕，没网时也能打开、查看和编辑文档。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | 整个 App（界面、编辑、导图、总结） |
| `manifest.webmanifest` | App 名称、图标、主题色、主屏幕快捷方式 |
| `sw.js` | Service Worker：缓存 App，离线可用，有新版本时提示更新 |
| `icons/` | App 图标（含 Android 自适应图标和 iPhone 主屏幕图标） |
| `api/claude.js` | 识别服务代理：把照片转发给 Claude，API Key 只放在服务器上 |
| `vercel.json` | 部署配置 |

## 识别服务怎么连

App 会按顺序自动选择：

1. **在 Claude App 里打开**：直接用你的 Claude 账号，不需要任何设置。
2. **个人 API Key**：在 App 的「我的 › 识别服务 › 连接设置」里填入 Anthropic API Key。Key 只保存在这台手机上，适合自己用。
3. **部署的服务器**（推荐给多人用）：照片发到 `api/claude`，由服务器带上 Key 转发给 Claude。

## 部署方法一：Vercel（推荐，带服务器）

1. 在 [console.anthropic.com](https://console.anthropic.com) 创建一个 API Key。
2. 把这个文件夹上传到一个 GitHub 仓库。
3. 在 [vercel.com](https://vercel.com) 选择 **Add New › Project**，导入这个仓库，框架选 **Other**，其余保持默认。
4. 在 **Settings › Environment Variables** 里添加：
   - `ANTHROPIC_API_KEY`：你的 API Key（必填）
   - `APP_PASSCODE`：一串自己定的口令（选填）。设置后，只有在 App 里填了同样口令的人才能使用识别，避免别人用你的额度。
5. 点 **Deploy**，得到一个 `https://xxx.vercel.app` 网址。

## 部署方法二：任何静态网站托管（不带服务器）

GitHub Pages、Netlify、Cloudflare Pages 都可以，直接上传整个文件夹即可（`api/` 和 `vercel.json` 会被忽略）。
打开后在「我的 › 识别服务 › 连接设置」里填入个人 API Key。

> PWA 必须通过 **https** 访问，上面这些托管服务都自带 https。

## 安装到手机

- **iPhone**：用 Safari 打开网址 → 点底部分享按钮 → 「添加到主屏幕」。
- **Android**：用 Chrome 打开网址，首页会出现「安装」卡片；也可以在浏览器菜单里选「安装应用」。
- 长按主屏幕图标，可以直接进入「扫描新页面」或「我的文档」。

## 发布新版本

修改 `index.html` 或图标后，把 `sw.js` 第一行的 `VERSION` 改成新的值（例如 `recordo-v2`）再部署。
用户下次打开时会看到「Recordo 有新版本」，点「更新」即可。

## 须知

- 文档保存在手机浏览器的本地存储里，不会上传到服务器。卸载 App 或清除网站数据会删除文档。本地存储容量有限（通常约 5MB），旧文档的预览图会在空间不足时自动去掉。
- 识别和总结会调用 Claude API，费用记在 API Key 所属的账户上。默认模型是 `claude-sonnet-5-5`，「快速模式」用 `claude-haiku-5-5`；在 `index.html` 的 `MODELS` 和 `api/claude.js` 的 `ALLOWED_MODELS` 里可以修改。
- 本地预览：在文件夹里运行 `python3 -m http.server 8000`，然后打开 `http://localhost:8000`。这样只有静态页面，识别需要填个人 API Key；想连同服务器一起测试，可以用 `npx vercel dev`。
