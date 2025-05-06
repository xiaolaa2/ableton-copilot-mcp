# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2025-04-29
- Added support for BASE_PATH environment variable to specify log and data file storage path for MCP
- Introduced database migration system with initial migration setup
- Implemented operation history and snapshot features for better state management
- Refactored tools and utilities for improved performance and maintainability
- Updated ESLint configuration for better code quality
- Removed pnpm lock file and switched to yarn for package management
- Added new tools for browser and device management in Ableton
- Enhanced error handling and performance monitoring capabilities
- Fixed database migration table name inconsistencies to match entity definitions
- Corrected field names and types in initial migration script
- Improved database schema synchronization between models and migrations
- Resolved redundant database backup creation issue


## [0.3.1] - 2023-10-25

### Added
- Added device parameter modification functionality
- Added recording control support

### Fixed
- Fixed missing log directory issue at application startup
- Fixed MIDI recording error handling

## [0.3.0] - 2023-10-22

### Added
- Added operation history feature with rollback support
- Added snapshot functionality

### Improved
- Improved error handling

## [0.2.0] - 2023-10-20

### Added
- Added audio clip creation functionality
- Added device deletion capability

### Fixed
- Fixed track creation index issues

## [0.1.0] - 2023-10-18

### Initial Release
- Basic Ableton Live control functionality
- MCP protocol support
- Base toolset implementation

## [0.1.2] - Initial Release

### Added
- Initial version release 
