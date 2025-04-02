# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] - 2025-04-02

### Changed
- Replace old publish scripts with new release scripts in package.json
- Add a new GitHub Actions workflow for automated npm publishing on version tags
- Update song-tools.ts documentation for clarity

## [0.3.0] - 2025-04-01

### Changed
- Refactor: Restructured Ableton initialization logic by moving it from main.ts to ableton.ts for better maintainability
- Added recording utility functions that support recording by time range and clip trimming
- Introduced async-mutex dependency to ensure thread safety during recording
- Fixed type definitions and comments to improve code readability
- Fixed incorrect track and clip color settings

## [0.2.0] - 2025-03-30

### Changed
- Refactor: Update tool names to use underscores instead of hyphens
  - Changed tool names in ClipTools, SongTools, and TrackTools to use underscores for consistency
  - Updated descriptions and parameter schemas accordingly

## [0.1.2] - Initial Release

### Added
- Initial version release 