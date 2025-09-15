# 3D Exhibition

A modern, high-performance 3D exhibition built with Three.js, TypeScript, and Vite.

## Features

- 🎨 **Modern 3D Gallery**: Interactive exhibition space with artwork displays
- ⚡ **High Performance**: Optimized rendering with WebGPU support when available
- 🎮 **Intuitive Controls**: Mouse and keyboard navigation
- 📊 **Performance Monitoring**: Real-time FPS, memory, and rendering stats
- 📱 **Responsive Design**: Adapts to different screen sizes
- 🧹 **Clean Architecture**: Modular, maintainable code structure

## Controls

- **Mouse**: Rotate camera around the scene
- **Scroll**: Zoom in/out
- **WASD**: Move camera position
- **R**: Reset camera to default position
- **F**: Toggle fullscreen
- **H**: Toggle help display

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── core/           # Core Three.js classes
│   ├── Scene.ts    # Scene management
│   ├── Camera.ts   # Camera setup
│   └── Renderer.ts # WebGL renderer
├── exhibition/     # Exhibition-specific code
│   └── ExhibitionScene.ts
├── controls/       # Camera controls
│   ├── OrbitControls.ts
│   └── CameraControls.ts
├── utils/          # Utilities
│   └── PerformanceMonitor.ts
├── App.ts          # Main application class
└── main.ts         # Entry point
```

## Performance Features

- **WebGPU Support**: Automatic fallback to WebGL
- **Frustum Culling**: Only render visible objects
- **Shadow Mapping**: Realistic lighting and shadows
- **Memory Management**: Automatic resource cleanup
- **Performance Monitoring**: Real-time stats display

## Technologies Used

- **Three.js**: 3D graphics library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **WebGPU**: Next-generation graphics API (when available)

## Browser Support

- Chrome 94+
- Firefox 90+
- Safari 15+
- Edge 94+

## Development

The project uses modern ES2022 features and follows clean architecture principles. All components are properly typed and include comprehensive error handling.

## License

MIT License
# tv-room
