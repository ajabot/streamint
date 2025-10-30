# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Streamint is a modern web radio streaming desktop application built with Electron 39, React 19, TypeScript, and Howler.js. It features a secure three-process architecture and a responsive UI for managing and playing internet radio streams.

## Architecture

### Three-Process Security Model

This is a modern Electron application with proper process isolation:

**Main Process** (`src/main/index.ts`):
- Node.js environment with full system access
- Creates and manages the BrowserWindow with secure settings:
  - `contextIsolation: true` - Isolates renderer context
  - `nodeIntegration: false` - Blocks Node.js access in renderer
  - `sandbox: true` - Additional security layer
- Handles IPC for config file operations in `~/.streamint/config.json`
- File system operations: read/write config, create directory
- Native dialogs via `electron.dialog`

**Preload Script** (`src/preload/index.ts`):
- Runs in isolated context between main and renderer
- Uses `contextBridge.exposeInMainWorld()` to expose safe API
- Exposes only: `config.read()`, `config.write()`, `dialog.showError()`
- Type-safe interface defined in `index.d.ts`

**Renderer Process** (`src/renderer/src/`):
- React 19 application with TypeScript
- NO direct Node.js or file system access
- Communicates via `window.electronAPI` from preload
- UI components: StationList, PlayerControls, VolumeControl
- Howler.js for audio streaming (HTML5 mode)

### Key Technical Details

**Audio Streaming**:
- Howler.js in HTML5 streaming mode (`html5: true`)
- Supports MP3 and AAC formats
- Volume stored in config (0.0-1.0)
- Error callbacks for load and playback failures
- React ref pattern for Howl instance lifecycle

**Configuration**:
- JSON file at `~/.streamint/config.json`
- Structure: `{ version, stations[], settings: { volume, lastStation } }`
- Automatically created with defaults on first run
- All file I/O through secure IPC handlers

**State Management**:
- React hooks (useState, useEffect, useRef)
- Config loaded on mount
- Auto-save volume and last station
- Cleanup on station switch (unload previous stream)

## Development Commands

```bash
npm run dev      # Development mode with hot reload
npm run build    # Production build
npm start        # Run production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── main/index.ts              # Main process, IPC handlers
├── preload/
│   ├── index.ts              # Context bridge
│   └── index.d.ts            # Type definitions
└── renderer/
    ├── src/
    │   ├── App.tsx           # Main component, state management
    │   ├── main.tsx          # React entry point
    │   ├── types.ts          # Shared types
    │   ├── index.css         # Tailwind directives, custom styles
    │   └── components/
    │       ├── StationList.tsx      # Station selection
    │       ├── PlayerControls.tsx   # Play/Stop buttons
    │       └── VolumeControl.tsx    # Volume slider
    └── index.html            # HTML shell
```

## Dependencies

**Runtime**:
- `electron`: ^39.0.0 (latest stable)
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `howler`: ^2.2.4
- `@electron-toolkit/utils`: utilities for Electron apps

**Build Tools**:
- `electron-vite`: ^4.0.1 (Vite-based build system)
- `vite`: ^7.1.12 (fast HMR, optimized builds)
- `@vitejs/plugin-react`: ^5.1.0
- `typescript`: ^5.9.3
- `@tailwindcss/postcss`: ^4.x (Tailwind v4 PostCSS plugin)
- `tailwindcss`: latest
- `autoprefixer`: latest

## Important Implementation Notes

### Security
- **NEVER enable nodeIntegration** - Always false
- **ALWAYS use contextIsolation** - Always true
- All file operations must go through IPC handlers in main process
- Validate and sanitize all IPC inputs

### Audio
- Create new Howl instance when playing a station
- Always call `sound.unload()` before switching stations or stopping
- HTML5 mode is REQUIRED for streaming (not Web Audio API)
- Use error callbacks (`onloaderror`, `onplayerror`) for user feedback

### Config File
- Main process ensures `~/.streamint/` directory exists
- Default config created automatically if missing
- Schema: see `config.example.json` for reference
- IPC handlers: `config:read`, `config:write`

### React Patterns
- Use `useRef` for Howl instance (persists across renders)
- Use `useEffect` for config loading on mount
- Use `useEffect` for volume synchronization
- Always cleanup (unload) on unmount or station change

### Build
- Tailwind v4 requires `@tailwindcss/postcss` plugin
- Config files: `tailwind.config.js`, `postcss.config.js`
- electron-vite handles main/preload/renderer separately
- Output: `out/` directory (git-ignored)

## Common Tasks

### Adding a new IPC handler
1. Add handler in `src/main/index.ts` with `ipcMain.handle()`
2. Add to preload API in `src/preload/index.ts`
3. Update type definitions in `src/preload/index.d.ts`
4. Use via `window.electronAPI.*` in renderer

### Adding a new UI component
1. Create in `src/renderer/src/components/`
2. Use TypeScript and import types from `../types`
3. Style with Tailwind utility classes
4. Import and use in `App.tsx`

### Modifying config schema
1. Update TypeScript interfaces in `src/renderer/src/types.ts` and `src/preload/index.ts`
2. Update IPC handlers in `src/main/index.ts`
3. Update `DEFAULT_CONFIG` in main process
4. Update `config.example.json`
5. Document in README.md
