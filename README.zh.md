# ableton-copilot-mcp

<div align="center">
  <img src="https://img.shields.io/badge/Ableton%20Live-12-9cf" alt="Ableton Live 版本">
  <img src="https://img.shields.io/badge/Node.js-20%2B-green" alt="Node.js 版本">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript 版本">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="许可证">
</div>

> 一个基于 [ableton-js](https://github.com/leolabs/ableton-js) 搭建的 MCP（Model Context Protocol）服务器，用于与 Ableton Live 的编排视图（Arrangement View）进行实时交互和控制，致力于辅助音乐制作人进行音乐制作。

## 🎯 注意

作为一名音乐制作人，我对使用Ableton来创作音乐有一些理解。其实在创作音乐的时候我们经常会需要解决一些比较繁琐的操作，比如音符属性人性化、合并音符、把一个轨道录制到另外一个音频轨道等，以前我们只能依赖于宿主DAW自己提供的一些功能来进行这些操作，但是现在大模型和MCP出现之后我们有了可以让AI帮我们进行自动化操作的可能性，尽管目前让AI直接生成音符、创作一首完整歌曲仍不太现实，它不能够生成出一个好听的歌曲，但让AI来帮我们进行辅助操作也是一种新的可能。

## 🎥 功能演示

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1094887375?h=7de6bffee1&badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="2025-06-20 09-09-28"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

## 🚀 功能特性

### 🎵 歌曲控制（Song）
- 获取歌曲基本信息（根音、音阶名称、速度、歌曲长度等）
- 获取所有音轨列表
- 创建 MIDI、音频和返送音轨
- 删除、复制音轨

### 🎹 音轨管理（Track）
- 获取音轨中的所有片段
- 在编排视图的轨道中创建空白 MIDI 片段
- 在轨道中根据给出的采样文件路径创建音频片段
- 设置音轨属性（静音、颜色、名称等）
- 复制 MIDI 片段到指定音轨

### 🎼 片段操作（Clip）
- 获取钢琴卷帘视图中的片段
- 获取、添加、删除和替换片段中的音符
- 设置片段属性（名称、颜色等）

### 🎧 音频操作（Audio）
- 支持对轨道内容进行录制

### 📝 状态管理（State）
- 操作历史记录追踪与详细日志
- 支持操作回滚（目前只支持音符操作）
- 浏览和恢复先前状态

### 🔌 设备管理（Device）
- 加载音频效果器、乐器和插件
- 修改设备参数
- 浏览库中可用设备

## 📝 待办事项
- 支持自动化包络的调整
- 支持更多快照类型（轨道属性、设备参数等）

## ⚠️ 注意
- 当AI直接对midi片段操作时可能会导致原有的音符丢失，无法使用ctrl + z 撤销，请谨慎操作，如有需要可以尝试让AI帮您回滚音符操作

## 📥 安装

### 必备条件 
- **Node.js** 环境：确保已安装 Node.js（建议 v20+），并可正常使用 `npx` 命令
  > 🔗 下载链接：[Node.js 官网](https://nodejs.org/)

### 安装步骤

#### 1. 安装 AbletonJS MIDI Remote Scripts

选择以下**三种方式之一**安装 MIDI Remote Scripts：

- **方式一：命令行一键安装（推荐）**  
  ```bash
  npx @xiaolaa2/ableton-copilot-mcp --install-scripts
  # 或使用简短形式
  npx @xiaolaa2/ableton-copilot-mcp -is
  ```

- **方式二：工具辅助安装**  
  1. 先启动 ableton-copilot-mcp（见下方使用方法）
  2. 让 AI 助手或手动调用 MCP 工具 `init_ableton_js` 完成自动安装
   
- **方式三：手动安装**  
  1. 在 Ableton 用户库中创建 "Remote Scripts" 文件夹：
     - Windows: `C:\Users\[用户名]\Documents\Ableton\User Library\Remote Scripts`
     - Mac: `/Users/[用户名]/Music/Ableton/User Library/Remote Scripts`
  2. 从 [ableton-js](https://github.com/leolabs/ableton-js) 项目下载 MIDI Remote Scripts
  3. 将下载的 `midi-script` 文件夹复制到上述位置
  4. 将文件夹重命名为 `AbletonJS`

## 🔧 使用方法

### 快速开始

1. **启动 Ableton Live**

2. **启用 AbletonJS 控制界面**
   - 打开 Ableton Live 设置：`Preferences` → `Link/MIDI`
   - 在 `MIDI` 标签页，找到 `Control Surface` 区域
   - 从下拉菜单中选择 `AbletonJS`

   <div align="center">
     <img src="./assets/images/setting.jpg" alt="Ableton Live MIDI Remote Scripts 配置" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
     <p><em>图1：Ableton Live 中启用 AbletonJS 控制界面</em></p>
   </div>

3. **连接 MCP 客户端**
   
   以下客户端均可作为 MCP 接入点：
   - [Cursor](https://www.cursor.com)
   - [Cherry Studio](https://github.com/CherryHQ/cherry-studio)
   - Claude Desktop
   - 其它MCP客户端


### 客户端配置

#### Cursor 配置示例

在 Cursor 设置中添加以下配置：

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp"
    ]
}
```

如需使用最新版本：

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp@latest"
    ]
}
```

#### 自定义数据存储路径（可选）

您可以通过环境变量 `BASE_PATH` 指定自定义数据存储位置：

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp"
    ],
    "env": {
        "BASE_PATH": "D:\\ableton_copilot_mcp"
    }
}
```

> 💡 **提示**：存储路径用于保存日志文件、操作历史和状态快照等数据


## ✅ 兼容性测试

兼容性主要取决于 ableton-js 库的版本支持情况

| Ableton Live 版本 | 测试状态 |
| ----------------- | ------- |
| 12.1.10           | ✅ 已测试可用 |
| 11.x              | ⚠️ 待测试 |
| 10.x              | ⚠️ 待测试 |

## 🤝 贡献

欢迎提交问题和贡献代码，请通过 [GitHub Issues](https://github.com/xiaolaa2/ableton-copilot-mcp/issues) 提交问题或建议。

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

## ⚠️ 免责声明
这是一个第三方集成项目，并非由 Ableton 官方开发。
