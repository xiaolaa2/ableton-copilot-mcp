# ableton-copilot-mcp

<div align="center">
  <img src="https://img.shields.io/badge/Ableton%20Live-12-9cf" alt="Ableton Live Version">
  <img src="https://img.shields.io/badge/Node.js-20%2B-green" alt="Node.js Version">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</div>

> An MCP (Model Context Protocol) server built on [ableton-js](https://github.com/leolabs/ableton-js) for real-time interaction and control with Ableton Live, dedicated to assisting music producers in their music production.

## 🎯 Note

As a music producer myself, I understand the challenges and needs during the music creation process. This tool aims to provide Ableton users with an intelligent and practical auxiliary system to make the creative process more natural and smooth. I always adhere to the core concept of "assisting creation" rather than blindly pursuing AI to generate complete musical notes – truly moving musical works are inseparable from unique human creativity and artistic perception, which is currently beyond the reach of AI technology.

## 🚀 Features

### 🎵 Song Control
- Get basic song information (root note, scale name, tempo, song length, etc.)
- Get a list of all tracks
- Create MIDI, audio, and return tracks
- Delete and duplicate tracks

### 🎹 Track Management
- Get all clips in a track
- Create empty MIDI clips
- Create audio clips in tracks based on provided sample file paths
- Set track properties (mute, color, name, arm, solo, etc.)
- Duplicate MIDI clips to specified tracks

### 🎼 Clip Operations
- Get clips in the piano roll view
- Get and manage all notes in a clip
- Add, delete, and replace notes in clips
- Set clip properties (name, color, looping, loop_start, loop_end, etc.)

### 🎧 Audio Operations
- Supports recording track content based on time range

### 🔌 Device Management
- Load audio effects, instruments and plugins
- Modify device parameters
- Browse available devices in the library

### 📝 State Management
- Operation history tracking and detailed logging
- Snapshot creation for critical operations
- Support for operation rollback (especially for note operations)
- Browse and restore previous states

## 📝 To-Do List
- Allow returning the created clip_id when creating midi clips (pending ableton-js update)
- Support automatic envelope adjustment

## ⚠️ Warning
- Direct manipulation of MIDI clips by AI may result in the loss of original notes and cannot be undone with Ctrl + Z. Please operate with caution. If needed, you can ask the AI to help you roll back note operations.

## 📥 Installation

1. Install **Node.js**: Make sure the npx command is available. It's recommended to install the latest stable version from the [Node.js official website](https://nodejs.org/)
2. Install **MIDI Remote Scripts**:
You can install MIDI Remote Scripts in two ways:

- Start ableton-copilot-mcp first and let the AI or manually call the MCP tool `init_ableton_js` to help you install automatically
- Manual installation:
  1. Download MIDI Remote Scripts from the [ableton-js](https://github.com/leolabs/ableton-js) project
  2. Copy the `midi-script` folder to [Ableton Live's MIDI Remote Scripts directory](https://help.ableton.com/hc/en-us/articles/209072009-Installing-third-party-remote-scripts)
  3. Rename it to `AbletonJS`

## 🔧 Usage

1. Ensure that Ableton Live is launched and running
2. Make sure AbletonJS Control Surface is enabled in your configuration:
   > **Path**: Settings -> Link, Tempo & MIDI -> MIDI -> Control Surface

   <div align="center">
     <img src="./assets/images/setting.jpg" alt="Ableton Live MIDI Remote Scripts Configuration" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
     <p><em>Figure 1: Enabling AbletonJS Control Surface in Ableton Live Configuration</em></p>
   </div>

3. Connect using an MCP client, including but not limited to:
   - [Cursor](https://www.cursor.com)
   - [Cherry Studio](https://github.com/CherryHQ/cherry-studio)
   - Claude Desktop

### Environment Variables

You can configure the following environment variables:

- `BASE_PATH`: Specify a custom path for logs and data storage (default: `C:\Users\<YourUsername>\.ableton-copilot-mcp` on Windows or `/home/<YourUsername>/.ableton-copilot-mcp` on Linux/Mac). This directory stores:
  - Log files: Contains operation logs and application status records
  - Database file: Stores project history, previous states, and other persistent data
  - Any additional data the application needs to maintain between sessions

Setting this variable allows you to control where application data is stored, which is useful for backup purposes or when working with multiple configurations.

### Cursor Configuration Example

Configure ableton-copilot-mcp in Cursor:

<span style="color: red">Currently, Cursor supports a maximum of 40 MCP tools, which may cause some features to be unavailable.</span>

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp"
    ]
}
```

For the latest features, you can use the @latest tag:

```json
"ableton-js-mcp": {
    "command": "npx",
    "args": [
        "-y",
        "@xiaolaa2/ableton-copilot-mcp@latest"
    ]
}
```

With custom BASE_PATH configuration:

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

## ✅ Compatibility Testing

Compatibility primarily depends on the version support of the [ableton-js](https://github.com/leolabs/ableton-js) library.

| Ableton Live Version | Test Status |
| -------------------- | ----------- |
| 12.1.10              | ✅ Tested and working |
| 11.x                 | ⚠️ Not tested yet |
| 10.x                 | ⚠️ Not tested yet |

## 🤝 Contributing

Issues and contributions are welcome. Please submit issues or suggestions through [GitHub Issues](https://github.com/xiaolaa2/ableton-copilot-mcp/issues).

## 📄 License

This project is licensed under the [MIT License](./LICENSE).