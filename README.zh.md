# ableton-copilot-mcp

<div align="center">
  <img src="https://img.shields.io/badge/Ableton%20Live-12-9cf" alt="Ableton Live 版本">
  <img src="https://img.shields.io/badge/Node.js-20%2B-green" alt="Node.js 版本">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript 版本">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="许可证">
</div>

> 一个基于 [ableton-js](https://github.com/leolabs/ableton-js) 搭建的 MCP（Model Context Protocol）服务器，用于与 Ableton Live 进行实时交互和控制，致力于辅助音乐制作人进行音乐制作。

## 🎯 注意

作为一名音乐制作人，我也许理解音乐创作过程中的挑战与需求。本工具旨在为Ableton使用者提供一套智能且实用的辅助系统，让创作过程更加自然流畅。我始终坚持"辅助创作"的核心理念，而非盲目追求让AI直接生成出完整的音符 —— 真正打动人心的音乐作品永远离不开人类独特的创造力与艺术感知，这是当前 AI 技术尚无法企及的领域。

## 🚀 功能特性

### 🎵 歌曲控制（Song）
- 获取歌曲基本信息（根音、音阶名称、速度、歌曲长度等）
- 获取所有音轨列表
- 创建 MIDI、音频和返送音轨
- 删除、复制音轨

### 🎹 音轨管理（Track）
- 获取音轨中的所有片段
- 在轨道中创建空白 MIDI 片段
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
- 关键操作的快照创建功能
- 支持操作回滚（特别是针对音符操作）
- 浏览和恢复先前状态

### 🔌 设备管理（Device）
- 加载音频效果器、乐器和插件
- 修改设备参数
- 浏览库中可用设备

## 📝 待办事项

## ⚠️ 注意
- 当ai直接对midi片段操作时可能会导致原有的音符丢失，无法使用ctrl + z 撤销，请谨慎操作

## 📥 安装准备
1. 安装 **Node.js**：确保 npx 命令可以正常运行，建议前往 [Node.js 官网](https://nodejs.org/) 安装最新的稳定版本
2. 安装 **MIDI Remote Scripts**：按照 [ableton-js](https://github.com/leolabs/ableton-js) 项目说明将 AbletonJS 的 MIDI Remote Scripts 安装到您的 Ableton Live 中

## 🔧 使用方法

1. 确保 Ableton Live 已经启动并运行
2. 确保在配置中启用 AbletonJS 控制界面：
   > **路径**：Settings -> Link, Tempo & MIDI -> MIDI -> Control Surface

   <div align="center">
     <img src="./assets/images/setting.jpg" alt="Ableton Live MIDI Remote Scripts 配置" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
     <p><em>图1：Ableton Live 中启用 AbletonJS 控制界面</em></p>
   </div>

3. 使用 MCP 客户端连接，支持的客户端包括但不限于：
   - [Cursor](https://www.cursor.com)
   - [Cherry Studio](https://github.com/CherryHQ/cherry-studio)
   - Claude Desktop

### 环境变量

您可以配置以下环境变量：

- `BASE_PATH`: 指定自定义的日志和数据存储路径（默认为用户主目录）

### Cursor 配置示例
<span style="color: red">目前 Cursor 最多仅支持40个mcp tool，有可能会导致部分功能不可用</span>

在 Cursor 中配置 ableton-copilot-mcp：

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp"
    ]
}
```

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