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
│       │   ├── App.tsx        # Main React component
│       │   ├── main.tsx       # React entry point
│       │   └── components/    # UI components
│       └── index.html  # HTML shell
├── electron.vite.config.ts  # Build configuration
├── package.json        # Dependencies and scripts
└── tsconfig.*.json     # TypeScript configurations
```

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

Streamint stores its configuration in `~/.streamint/config.json`. This file contains:
- List of radio stations
- User preferences (volume, last played station, etc.)

The configuration file is managed through secure IPC communication, ensuring the renderer process cannot directly access the file system.

## License

GPL-3.0-only - See LICENSE file for details

## Author

Aurelien Jabot

## Repository

https://github.com/ajabot/streamint
