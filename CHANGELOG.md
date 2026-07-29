# Changelog

All notable changes to this project will be documented in this file.

## [0.10.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.9.0...v0.10.0) (2026-07-29)


### Features

* batch clip note read/write ([9ab7bd3](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/9ab7bd3558e1b85baaff8c8e467ba4a25d960deb))
* batch clip note read/write ([9dbfb9f](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/9dbfb9f0b2df222dd19899bbe67ba737e14a70e8))
* get_track_overview, create_clips_batch, track sends ([fe472c4](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/fe472c490c236665db42e8c705af5911a3d168ff))
* get_track_overview, create_clips_batch, track sends ([d5e3a6b](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/d5e3a6b1ccad18b70f4670867f075b8687ef11ce))


### Bug Fixes

* load_device can silently land on the wrong track ([f4d4211](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/f4d42118b930439a6f9d6a0488b47b3798bbdb00))
* load_device can silently land on the wrong track ([c442b50](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/c442b5034d965cc62a5d115f2ad0a07c47ddcec6))

## [0.9.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.8.0...v0.9.0) (2026-03-14)


### Features

* upgrade ableton-js to v4.0.4 and optimize note field abbreviations ([9f68107](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/9f68107493757b0b850b4de19448a9e6698c4b77))

## [0.8.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.7.0...v0.8.0) (2025-06-21)


### Features

* Add application utility class and enhance clip tools functionality ([aa8392d](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/aa8392d5a5b6a072b60f1ca16ea11ce1368fbebe))
* Add application utility class and enhance clip tools functionality ([8b7efd1](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/8b7efd1601aa61fad4125bd47f4ee89cbf3214b2))

## [0.7.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.6.3...v0.7.0) (2025-06-18)


### Features

* Update Ableton-js version and support extended note features for Ableton Live 11 ([7312fd1](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/7312fd19d83dfd594a3bab8876e4eb254945e39d))


### Bug Fixes

* Fix history state type checking and optimize note rollback logic ([aa97940](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/aa979404e95e649036387fc401074238b02a5a2f))
* Remove historyId parameter from removeClipNotesById interface ([ea0caea](https://github.com/xiaolaa2/ableton-copilot-mcp/commit/ea0caea448dff1a3e5d9d3cdcad488822a3a7819))

## [0.6.3](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.6.2...v0.6.3) (2025-05-10)


### 🐛 Bug Fixes

* Enhanced rollback operation safety: Validating operation history status as successful before performing rollback to prevent rollback of incomplete or failed operations

## [0.6.2](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.6.1...v0.6.2) (2025-05-08)


### 🚀 Features

* Added command line support for installing ableton-js scripts

## [0.6.1](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.5.0...v0.6.1) (2025-05-08)


### 🚀 Features

* Added MCP tool init_ableton_js to support automatic initialization of ableton-js and automatic installation of MIDI Remote Scripts

## [0.5.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.4.3...v0.5.0) (2025-05-07)


### 🚀 Features

* Implemented database functionality with TypeORM
* Added database initialization and migration handling
* Introduced OperationHistory and Snapshot entities for tracking operations and snapshots
* Implemented create, update, and rollback functionalities for operation histories and snapshots
* Enhanced clip tools to support snapshot creation during note operations
* Updated main application flow to initialize the database and handle migrations
* Added migration scripts for initial database setup
* Used sql.js as TypeORM database driver to avoid Python dependency for SQLite compilation

## [0.4.3](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.4.2...v0.4.3) (2025-05-06)


### 🐛 Bug Fixes

* Temporarily removed operation rollback feature to prevent exceptions during MCP server installation due to SQLite third-party library compilation issues
* Fixed delete_track functionality not working when input parameter is audio

## [0.4.2](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.4.1...v0.4.2) (2025-05-06)


### 🐛 Bug Fixes

* fix some bugs

## [0.4.1](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.4.0...v0.4.1) (2025-05-06)


### 🐛 Bug Fixes

* fix some bugs

## [0.4.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.3.1...v0.4.0) (2025-05-06)


### 🚀 Features

* Added support for BASE_PATH environment variable to specify log and data file storage path for MCP
* Introduced database migration system with initial migration setup
* Implemented operation history and snapshot features for better state management
* Refactored tools and utilities for improved performance and maintainability
* Updated ESLint configuration for better code quality
* Removed pnpm lock file and switched to yarn for package management
* Added new tools for browser and device management in Ableton
* Enhanced error handling and performance monitoring capabilities


### 🐛 Bug Fixes

* Fixed database migration table name inconsistencies to match entity definitions
* Corrected field names and types in initial migration script
* Improved database schema synchronization between models and migrations
* Resolved redundant database backup creation issue

## [0.3.1](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.3.0...v0.3.1) (2025-04-02)


### 🚀 Features

* Added device parameter modification functionality
* Added recording control support


### 🐛 Bug Fixes

* Fixed missing log directory issue at application startup
* Fixed MIDI recording error handling

## [0.3.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.2.0...v0.3.0) (2025-04-01)


### 🚀 Features

* Added operation history feature with rollback support
* Added snapshot functionality


### ♻️ Refactoring

* Improved error handling

## [0.2.0](https://github.com/xiaolaa2/ableton-copilot-mcp/compare/v0.1.0...v0.2.0) (2025-04-01)


### 🚀 Features

* Added audio clip creation functionality
* Added device deletion capability


### 🐛 Bug Fixes

* Fixed track creation index issues

## [0.1.0](https://github.com/xiaolaa2/ableton-copilot-mcp/releases/tag/v0.1.0) (2025-03-30)


### 🚀 Features

* Basic Ableton Live control functionality
* MCP protocol support
* Base toolset implementation
