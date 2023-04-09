# Change Log

All notable changes to the "obs-switcher" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2023-04-09

- Works with OBS v28 and newer
- Defaults to autostart with VS Code, with improved timings
- Defaults port to default obs-websocket port 4455
- Reduced size considerably
- New indicator icon (bottom right) showing whether the active file is being hidden or not
- Removed connected/disconnected messages in order to avoid clutter when connecting and disconnecting
- "Cut" transition fallback to a "Cut"-alike transition whenever Cut is not found. Will usually default to the equivalent of "Cut" on OBS setups where the locale isn't English

## [0.1.1] - 2020-12-09

- Added option to set transition name. (defaults to "Cut")

## [0.1.0] - 2020-10-14

- Initial release
