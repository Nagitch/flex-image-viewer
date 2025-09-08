Flex Image Viewer (SvelteKit)

Overview
- PC-focused folder image viewer as a PWA
- Uses File System Access API to select a local folder and render images
- Masonry layout minimizes whitespace (PureRef-like packing)
- Options: gap, min/max width, enlarge small images, decode concurrency
- Lazy decoding and viewport-aware rendering to preserve performance
- Built with SvelteKit + static adapter for standalone hosting

Getting Started
1) Install deps
   pnpm install

2) Dev server
   pnpm run dev

3) Build static site
   pnpm run build && pnpm run preview

Usage
- Press F or click "Choose folder…" to select a folder
- Adjust layout options in the top panel
- The viewer progressively decodes image dimensions and lays out items
- Images load (assign src) only when near the viewport

PWA
- Manifest at static/manifest.webmanifest
- Service worker at src/service-worker.ts pre-caches app shell for offline

Notes
- The File System Access API is supported on Chromium-based desktop browsers
- "Enlarge small images" prevents/permits upscaling beyond natural width
- Layout auto-computes an appropriate column width between min/max bounds

Future Ideas
- Keyboard navigation and fullscreen viewer
- Drag to rearrange or pin images
- Persist option presets in localStorage
- Import remote folders via drag-and-drop of directories (when supported)

