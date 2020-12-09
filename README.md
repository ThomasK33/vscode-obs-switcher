# OBS Switcher

A Visual Studio Code extension to switch OBS scenes automatically when opening files previously marked to contain sensitive / secret data (e.g. .env files).

## Features

- Auto connect to OBS on launch
- Set an OBS websocket password in your keychain / Secret Service API (libsecret) / Credential Vault.
- Add & remove selected files to the list of secret files straight from the file explorer.
- Switch scenes if the opened filename matches to a regexp in the workspace settings
- Automatically switch back when file containing secrets is closed again

## Requirements

This extension requires [OBS Studio](https://obsproject.com/) and the [OBS Websocket extension](https://github.com/Palakis/obs-websocket) installed.

## Extension Settings

This extension contributes the following settings:

- `obsSwitcher.fileNames`: File names to trigger the scene switching (default: `*.env*`)
- `obsSwitcher.autoSwitchBack`: Switch back after closing a secret file (default: `true`)
- `obsSwitcher.sceneName`: OBS scene to switch to when a secret file is opened
- `obsSwitcher.transition`: OBS transition to be used when switching between scenes
- `obsSwitcher.address`: OBS Websocket address (default: `localhost:4444`)
- `obsSwitcher.secure`: Secure OBS Websocket connection (default: `false`)
- `obsSwitcher.autoConnect`: If active, this extension will try to automatically connect to the OBS Websocket endpoint (default: `false`)

## Known Issues

- None at the time of writing

## Release Notes

### 0.1.1

Added option to set transition name. (defaults to "Cut")

### 0.1.0

Initial release
