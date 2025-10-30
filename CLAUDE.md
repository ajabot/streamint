# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Streamint is a webradio streaming software built with Electron and Howler.js. It provides a simple desktop application interface for playing internet radio streams.

## Architecture

This is an Electron application with a standard main/renderer process architecture:

- **main.js**: Electron main process that creates and manages the application window
  - Creates a single BrowserWindow with nodeIntegration enabled
  - Standard Electron window lifecycle management

- **renderer.js**: Renderer process handling the audio streaming logic
  - Uses Howler.js library for audio playback
  - Manages stream playback, volume control, and audio lifecycle
  - Note: Uses deprecated `electron.remote` API for dialog access

- **index.html**: Simple UI with text input for stream URL and control buttons (Play, Stop, Volume Up/Down)

### Key Technical Details

- **Audio Playback**: Implemented via Howler.js with HTML5 audio backend
  - Supports MP3 and AAC stream formats
  - Volume controlled globally through Howler.volume()
  - Initial volume set to 0.5, adjusted in 0.1 increments

- **Node Integration**: The app enables nodeIntegration in webPreferences, allowing direct Node.js API access in the renderer process (security consideration for future updates)

## Development Commands

### Run the application
```bash
npm start
```

### Run with debugging
```bash
npm run inspect
```
This starts Electron with the inspector enabled for debugging the main process.

## Dependencies

- **electron**: ^5.0.6 (Electron framework - note this is an older version)
- **howler**: ^2.1.2 (Audio playback library)

## Important Notes

- The app uses an older version of Electron (5.0.6) which may have security implications and deprecated APIs
- `electron.remote` is used in renderer.js (line 5) but is deprecated in newer Electron versions
- NodeIntegration is enabled, which is a security concern for apps loading remote content (though this app loads local content only)
