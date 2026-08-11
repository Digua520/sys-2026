<div align="center">

# ⚔️ SYS.2026 // 毕业生社会化全景诊断系统

**The 2026 Graduate Socialization Survival Diagnostic Tool (RPG Edition)**

[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success?style=for-the-badge)](https://github.com/)
[![DeepSeek](https://img.shields.io/badge/AI_Engine-DeepSeek_API-blue?style=for-the-badge&logo=deepseek&logoColor=white)](https://platform.deepseek.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![A11y](https://img.shields.io/badge/A11y-prefers--reduced--motion-ff69b4?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

<br/>

```
╔══════════════════════════════════════════════════════════════╗
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
║  ▓  ██████╗  ██████╗ ██████╗  ██████╗  2026 届毕业生   ▓  ║
║  ▓  ██╔══██╗██╔═══██╗██╔══██╗██╔════╝  社会化全景诊断  ▓  ║
║  ▓  ██████╔╝██║   ██║██████╔╝██║  ███╗  RPG 副本版     ▓  ║
║  ▓  ██╔══██╗██║   ██║██╔══██╗██║   ██║                 ▓  ║
║  ▓  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝  ▶ PRESS START  ▓  ║
║  ▓  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                  ▓  ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
╚══════════════════════════════════════════════════════════════╝
```

*在不确定的时代，算清你的生存筹码。*
*Calculate your survival chips in an era of uncertainty.*

</div>

---

[English](#english) | [简体中文](#简体中文)

---

## 简体中文

### 📌 项目简介

**SYS.2026** 是一款面向即将步入社会的大学毕业生（特指2026届）的硬核生存体检工具。它披着 8-bit 复古像素 JRPG 的极客外衣，内核搭载了一个**高度解耦、纯数据驱动的 Vanilla JS 规则引擎**。

本项目旨在探索**不依赖任何重型框架（No React / No Vue）**，仅通过纯原生 JavaScript 构建具备高鲁棒性、优雅状态管理及 AI 流式响应的现代化交互式 Web 应用。

### ✨ 核心特性

- 🎮 **沉浸式像素游戏 UX** — 纯 CSS 构建的 Chunky 像素框线、CRT 屏幕扫描线特效（Scanlines）、RPG 战斗指令菜单，配合 AI 流式打字机效果，营造极致的 JRPG 副本体验。
- 🧠 **三阶段工业级规则引擎** —
  - **Phase 1** — 雷达图向量计分（5 维 × 10 题 × 3 选项）：每题选项同时影响务实、求稳、破局、技术、人情五个维度，信息密度 ×5。
  - **Phase 2** — 主副属性交叉矩阵：取最高分（主属性）和次高分（副属性），查表命中 **5 × 4 = 20 种隐藏职业**（如"赛博拓荒者""隐形操盘手"）。
  - **Phase 3** — 基因片段拼接：4 个报告板块按维度分段动态组合，理论组合数 **>1200 种**，真正千人千面。
- 🤖 **DeepSeek API 无缝集成** — 支持 API Key 本地接入；利用 Streams API 实现 AI 实时打字机渲染；内置 `fetchWithTimeout`（15 秒超时 + AbortController），API 不可用时自动回退至本地 NPC 引擎。
- 🛡️ **隐私优先与防御性编程** — 0 服务器上传，100% 客户端计算；`safeStore`/`safeLocal` 代理封装所有 storage 调用，完美兼容 Safari 隐身模式；无任何裸 `sessionStorage`/`localStorage` 调用。
- ♿ **无障碍支持** — 原生支持 `prefers-reduced-motion`，为前庭障碍/光敏用户自动关闭 CRT 闪烁与高频动画。

### 🏗️ 项目结构

```text
📁 就业系统/
├── 📄 README.md                   ← you are here
├── 📄 rpg-version.html            🔥 核心产品：单文件像素 RPG 版
│                                   （包含 CSS + 3-Phase 引擎 + DeepSeek + 全流程 UI）
│
├── 📄 index.html                  原始入口（多文件标准版）
├── 📁 css/
│   └── 📄 style.css               标准版样式
├── 📁 js/
│   ├── 📄 questions.js            题库数据（原始 8 原型版）
│   ├── 📄 rule-engine.js          规则引擎（原始 8 原型版，遗留参考）
│   ├── 📄 deepseek.js             DeepSeek 客户端（原始版）
│   └── 📄 app.js                  应用控制器（原始版）
└── 📄 大学生问卷系统.txt          原始产品设计文档
```

> **说明：** 核心产品为 `rpg-version.html`（单文件，包含完整的三阶段算法引擎、20 职业矩阵、CRT 像素 UI、流式 AI 响应等全部特性）。`js/` 目录下的文件为早期多文件版本的遗留代码，保留供对比参考。

### 🚀 快速开始

本项目为零构建（Zero-Build）设计，开箱即用：

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/sys-2026.git
cd sys-2026

# 2. Open in browser
# Windows: 双击 rpg-version.html
# macOS:   open rpg-version.html
# Linux:   xdg-open rpg-version.html

# 3. (推荐) 用 Live Server 运行获得最佳体验
npx serve .
# 然后访问 http://localhost:3000/rpg-version.html
```

### 🕹️ 玩法流程

1. **PRESS START** — 街机标题画面，按 Enter 或点击开始。
2. **10 道核心副本** — RPG 对话框 + 战斗指令菜单 `[A] [B] [C]`，每题配有系统点拨。
3. **灵魂留白（第 11 题）** — 可选。写一段话给 AI 老陆，或直接跳过。
4. **生成路书** — 引擎分析 → AI 打字机实时回应（需配置 API Key）或本地引擎降级。
5. **角色面板** — 查看你的隐藏职业、5 维属性面板、生存战壕、反杀手段、情感防弹衣、热血定调。

### ⚙️ DeepSeek API 配置（可选）

1. 访问 [platform.deepseek.com](https://platform.deepseek.com) 注册并获取 API Key。
2. 在结果页底部点击 **⚙ API设置**，输入 `sk-...` 并保存。
3. 再次生成路书时，Q11 的灵魂留白将获得 AI 个性化深度回应（单次成本约 ¥0.003）。

不配置 API Key 也可以正常使用全部功能——系统内置了本地降级引擎。

### 🧪 技术亮点速览

| 特性 | 实现方式 |
|------|----------|
| 向量计分 | `VECTORS` 字典 — 11 键 × 3 选项 × 5 维数组，纯数据驱动 |
| 动态归一化 | `VECTOR_BOUNDS` — 模块加载时预计算理论 min/max，消除 magic number |
| 职业矩阵 | `PROFESSION_MATRIX` — 嵌套对象，`??` 可选链 fallback |
| 文本拼接 | `FRAGMENTS` + `pick2()`/`pick1()` helper — 9×9×3×5 组合 |
| 事件系统 | 全局 `document` 事件委托 + `data-action` 指令 |
| 流式 AI | `fetchWithTimeout` + `ReadableStream` + `TextDecoder` 逐 chunk 解析 |
| 存储安全 | `safeStore`/`safeLocal` — try/catch 代理，隐私模式 0 崩溃 |
| CRT 效果 | 3 层叠加 — `repeating-linear-gradient`（扫描线）+ `radial-gradient`（暗角）+ CSS animation（微闪） |

---

## English

### 📌 About

**SYS.2026** is a hardcore "socialization survival diagnostic tool" for the graduating class of 2026. Wrapped in an 8-bit retro JRPG shell, it is powered by a **decoupled, data-driven Vanilla JS rule engine**.

This project is an architectural experiment: building a robust, state-managed, AI-integrated modern web application with **zero framework dependencies**.

### ✨ Core Features

- 🎮 **Immersive Gamified UX** — Pure CSS chunky pixel borders, CRT scanline overlays, and RPG battle-command menus, paired with a streaming typewriter effect for AI responses.
- 🧠 **3-Phase Rule Engine** —
  - **Phase 1** — Vector Scoring: every answer simultaneously affects 5 dimensions across a radar chart.
  - **Phase 2** — Primary-Secondary Matrix: top 2 dimensions map to **20 unique professions** (e.g., "Cyber Pioneer", "Shadow Operator").
  - **Phase 3** — Gene Splicing: 4 report modules assembled from dimension segments → **1200+ combinations**.
- 🤖 **DeepSeek Integration** — Streams API for live typewriter rendering. `fetchWithTimeout` (15s + AbortController) with automatic fallback to a local offline engine.
- 🛡️ **Privacy-First & Defensive** — 100% client-side. `safeStore`/`safeLocal` wrappers prevent crashes in Safari Private Browsing. Zero bare storage calls.
- ♿ **Accessibility** — `prefers-reduced-motion` support. CRT flicker and animations auto-disable for photosensitive users.

### 🏗️ Project Structure

```text
📁 就业系统/
├── 📄 rpg-version.html            🔥 Main product: single-file RPG edition
│                                   (CSS + 3-Phase engine + DeepSeek + full UI)
├── 📄 index.html                  Original multi-file entry
├── 📁 css/ ─── 📄 style.css       Original stylesheet
├── 📁 js/
│   ├── 📄 questions.js            Legacy question bank (8-archetype version)
│   ├── 📄 rule-engine.js          Legacy rule engine (kept for reference)
│   ├── 📄 deepseek.js             Legacy DeepSeek client
│   └── 📄 app.js                  Legacy app controller
└── 📄 大学生问卷系统.txt           Original design document (Chinese)
```

> **Note:** The core product is `rpg-version.html` — a single-file application containing the full 3-phase algorithm, 20-profession matrix, CRT pixel UI, streaming AI, and all other features. The `js/` directory contains legacy multi-file code retained for reference.

### 🚀 Getting Started

Zero build tools required.

```bash
git clone https://github.com/yourusername/sys-2026.git
cd sys-2026

# Open in browser
open rpg-version.html        # macOS
# OR double-click in Explorer / run xdg-open on Linux

# (Optional) Live Server
npx serve .
# → http://localhost:3000/rpg-version.html
```

### 🧪 Tech Highlights

| Feature | Implementation |
|---------|---------------|
| Vector scoring | `VECTORS` dictionary — 11 keys × 3 options × 5-dim arrays |
| Dynamic normalization | `VECTOR_BOUNDS` — pre-computed at module load, zero magic numbers |
| Profession matrix | `PROFESSION_MATRIX` — nested object with `??` optional chaining |
| Text assembly | `FRAGMENTS` + `pick2()`/`pick1()` helpers — 9×9×3×5 combos |
| Event system | Global `document` event delegation + `data-action` directives |
| Streaming AI | `fetchWithTimeout` + `ReadableStream` + `TextDecoder` per-chunk |
| Storage safety | `safeStore`/`safeLocal` — try/catch proxies, 0 crashes in Incognito |
| CRT effects | 3 stacked overlays — scanlines + vignette + micro-flicker animation |

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

<br/>

<div align="center">

*Built with raw JavaScript, strict code hygiene, and a lot of retro passion.*

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░  Ⓒ 2026 SURVIVAL ROADMAP SYSTEM · RPG EDITION  ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

</div>
