# Streamint

A modern desktop application for streaming web radio stations, built with Electron, React, and TypeScript.

## Overview

Streamint is a cross-platform desktop application that allows users to listen to internet radio streams. It provides a simple, responsive interface for managing and playing radio stations from a configuration file.

## Technology Stack & Design Decisions

### Why Electron?

Electron was chosen for several compelling reasons:

1. **Cross-platform**: Write once, run on Windows, macOS, and Linux
2. **Web technologies**: Leverage modern web development tools (React, TypeScript, Vite)
3. **Native integration**: Access to file system and native OS features while maintaining a web-based UI
4. **Rich ecosystem**: Large community and extensive tooling support
5. **Desktop-first experience**: Unlike web apps, provides a dedicated application window with OS-level integration

### Why React?

React was selected as the UI framework because:

1. **Component-based**: Perfect for building modular UI elements (station list, player controls, volume slider)
2. **Declarative**: Makes UI state management predictable and easier to debug
3. **Virtual DOM**: Efficient updates for responsive user interactions
4. **TypeScript support**: First-class TypeScript integration for type safety
5. **Large ecosystem**: Extensive library of components and tools

### Why Howler.js for Audio?

Howler.js was chosen over other audio solutions for these reasons:

1. **Streaming support**: Built-in HTML5 streaming mode perfect for web radio
2. **Format flexibility**: Automatic codec detection, supports MP3, AAC, and more
3. **Simple API**: Straightforward play/pause/stop/volume controls
4. **Cross-browser**: Reliable audio playback across all platforms
5. **Error handling**: Built-in callbacks for load and playback errors
6. **Proven track record**: Battle-tested library used in production by many applications

**Alternative considered**: Native HTML5 Audio API was considered but requires more manual stream handling and lacks Howler's convenient features.

### Why Tailwind CSS?

Tailwind was selected for styling because:

1. **Utility-first**: Rapid UI development with pre-built utility classes
2. **Responsive design**: Built-in responsive modifiers for mobile/desktop layouts
3. **Customizable**: Easy to extend with custom design tokens
4. **Small bundle**: Tree-shaking removes unused styles in production
5. **No CSS conflicts**: Scoped utilities prevent style collisions

### Why electron-vite?

electron-vite provides the build tooling because:

1. **Vite performance**: Lightning-fast HMR (Hot Module Replacement) during development
2. **Process separation**: Proper handling of Electron's main/renderer/preload processes
3. **TypeScript native**: Zero-config TypeScript support
4. **Modern ESM**: Uses modern JavaScript modules
5. **Optimized builds**: Fast production builds with code splitting

## Project Architecture

### Electron Process Model

Electron applications run in multiple processes for security and stability:

```
┌─────────────────────────────────────────┐
│          Main Process (Node.js)          │
│  - Creates windows                       │
│  - Handles file system operations        │
│  - Manages application lifecycle         │
│  - Reads/writes config (~/.streamint)    │
└──────────────┬──────────────────────────┘
               │
               │ IPC (Inter-Process Communication)
               │
┌──────────────┴──────────────────────────┐
│         Preload Script                   │
│  - Runs in isolated context              │
│  - Exposes safe APIs to renderer         │
│  - Bridge between main and renderer      │
└──────────────┬──────────────────────────┘
               │
               │ contextBridge
               │
┌──────────────┴──────────────────────────┐
│      Renderer Process (Chromium)         │
│  - React application                     │
│  - UI components                         │
│  - Howler.js audio playback              │
│  - NO direct Node.js access (security)   │
└──────────────────────────────────────────┘
```

### Why This Architecture?

**Security**: The renderer process (which displays web content) cannot directly access Node.js or file system. This prevents malicious code from compromising the user's system.

**Separation of concerns**:
- Main process handles system-level operations
- Renderer process focuses on UI and user interactions
- Preload script acts as a controlled bridge

**Process isolation**: If the renderer crashes, the main process remains stable and can restart the window.

### Directory Structure

```
streamint/
├── src/
│   ├── main/           # Main process (Node.js)
│   │   └── index.ts    # Application entry, window creation, IPC handlers
│   ├── preload/        # Preload scripts
│   │   └── index.ts    # Context bridge, exposes safe APIs
│   └── renderer/       # Renderer process (React app)
│       ├── src/
│       │   ├── App.tsx              # Main React component with state management
│       │   ├── main.tsx             # React entry point
│       │   ├── types.ts             # TypeScript type definitions
│       │   ├── index.css            # Global styles and Tailwind directives
│       │   └── components/          # UI components
│       │       ├── StationList.tsx      # Radio station selection list
│       │       ├── PlayerControls.tsx   # Play/Stop controls
│       │       └── VolumeControl.tsx    # Volume slider
│       └── index.html  # HTML shell
├── electron.vite.config.ts  # Build configuration
├── package.json        # Dependencies and scripts
└── tsconfig.*.json     # TypeScript configurations
```

## UI Components

### StationList Component
Displays all configured radio stations in a scrollable list:
- Highlights currently selected station in blue
- Shows favorite stations with a star icon
- Click to select a station (stops current playback)
- Shows helpful message when no stations are configured

### PlayerControls Component
Main playback interface:
- Displays currently selected station name
- **Play button**: Starts streaming the selected station
  - Disabled when no station selected or already playing
  - Uses green color to indicate action
- **Stop button**: Stops current playback
  - Disabled when not playing
  - Uses red color for stop action
- Button states clearly communicated through color and disabled states

### VolumeControl Component
Adjusts audio output volume:
- Range slider from 0-100%
- Real-time volume adjustment using Howler.js
- Displays current volume percentage
- Volume setting persisted to config file
- Custom styled slider with blue accent color

## Audio Streaming with Howler.js

### How It Works

The application uses Howler.js in HTML5 streaming mode to play internet radio:

1. **Stream Initialization**: When user clicks Play, a new `Howl` instance is created:
   ```typescript
   new Howl({
     src: [stationUrl],
     html5: true,        // Critical: enables streaming
     format: ['mp3', 'aac'],
     volume: currentVolume
   })
   ```

2. **HTML5 Mode**: The `html5: true` flag tells Howler to use HTML5 Audio element instead of Web Audio API. This is essential for streaming because:
   - HTML5 Audio progressively loads data (streaming)
   - Web Audio API would try to load the entire file (impossible for live streams)
   - Lower latency and memory usage

3. **Format Detection**: Howler automatically detects the audio codec (MP3 or AAC) from the stream

4. **Volume Control**: Volume changes apply immediately to the current Howl instance

5. **Cleanup**: When switching stations or stopping, `sound.unload()` releases resources

### Error Handling

The app handles two types of streaming errors:

- **Load Errors** (`onloaderror`): Network issues, invalid URL, CORS problems
  - Shows error dialog with station name
  - Resets playing state

- **Play Errors** (`onplayerror`): Codec issues, unsupported format
  - Shows error dialog
  - Resets playing state

Both errors are logged to console for debugging and shown to user via native dialog.

### State Management

Audio state is managed in App.tsx:
- **soundRef**: React ref holding current Howl instance
- **isPlaying**: Boolean tracking playback state
- **volume**: Number (0-1) controlling audio level
- **currentStation**: Currently selected station object

The ref pattern ensures the Howl instance persists across re-renders without recreation.

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or v22.12.0+)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/ajabot/streamint.git
cd streamint

# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview production build locally
- `npm start` - Run the production build (alias for preview)

## Configuration

### Config File Location

Streamint stores its configuration in `~/.streamint/config.json`:
- **macOS/Linux**: `/Users/username/.streamint/config.json` or `/home/username/.streamint/config.json`
- **Windows**: `C:\Users\username\.streamint\config.json`

The file and directory are automatically created on first launch if they don't exist.

### Config File Format

The configuration file is JSON with the following structure:

```json
{
  "version": "1.0",
  "stations": [
    {
      "id": "unique-id-1",
      "name": "Station Name",
      "url": "https://example.com/stream",
      "favorite": false
    }
  ],
  "settings": {
    "volume": 0.5,
    "lastStation": "unique-id-1"
  }
}
```

### Config Fields Explained

**stations** (array): List of radio stations
- `id` (string): Unique identifier for the station (use any unique string)
- `name` (string): Display name shown in the UI
- `url` (string): Direct URL to the audio stream (must be MP3 or AAC)
- `favorite` (boolean): Whether to show star icon (currently cosmetic)

**settings** (object): User preferences
- `volume` (number): Audio volume from 0.0 to 1.0 (automatically updated by app)
- `lastStation` (string|null): ID of last selected station (automatically updated)

### Adding Radio Stations

To add new stations, edit `~/.streamint/config.json`:

1. **Find stream URLs**: Many radio stations publish their stream URLs. Look for:
   - `.mp3` or `.aac` direct stream links
   - Icecast/Shoutcast server URLs
   - M3U playlist files (open them to find the actual stream URL)

2. **Add to config**:
   ```json
   {
     "id": "bbc-radio1",
     "name": "BBC Radio 1",
     "url": "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
     "favorite": false
   }
   ```

3. **Restart the app** or use File > Reload to load new stations

### Example Configuration

```json
{
  "version": "1.0",
  "stations": [
    {
      "id": "jazz24",
      "name": "Jazz24",
      "url": "https://live.wostreaming.net/direct/ppm-jazz24aac-ibc1",
      "favorite": true
    },
    {
      "id": "soma-drone",
      "name": "SomaFM Drone Zone",
      "url": "https://ice1.somafm.com/dronezone-128-aac",
      "favorite": false
    },
    {
      "id": "nts1",
      "name": "NTS Radio 1",
      "url": "https://stream-relay-geo.ntslive.net/stream",
      "favorite": true
    }
  ],
  "settings": {
    "volume": 0.7,
    "lastStation": "jazz24"
  }
}
```

### Security Note

The configuration file is accessed through secure IPC handlers in the main process. The renderer process (UI) cannot directly read or write files, preventing potential security vulnerabilities. All file operations are validated and sanitized in the main process before execution.

## License

GPL-3.0-only - See LICENSE file for details

## Author

Aurelien Jabot

## Repository

https://github.com/ajabot/streamint
