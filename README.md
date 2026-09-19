# ◈ CHRONOS-OS

> **3D System Telemetry & Quantum State Visualizer**  
> An interactive cyberpunk desktop interface built with **Electron**, **Three.js**, **GPGPU compute shaders**, and **Web Audio API**.

---

## ✦ Overview

**CHRONOS-OS** transforms live hardware performance metrics into a reactive, real-time 3D quantum simulation. Rather than standard static charts, system load is visualized through high-density particle dynamics, simplex-noise geometry deformation, and atmospheric procedural audio synthesis.

---

## ✦ Features

- **GPGPU Compute Particle Kernel**: Simulates **102,400 particles** running simultaneously on the GPU via ping-pong float framebuffers, animated with 3D curl noise turbulence and memory-scaled gravitational attractor fields.
- **Dynamic Core Monolith**: Deformed via 4D simplex noise vertex shaders reacting directly to instantaneous CPU stress, featuring multi-layered Fresnel luminescence and pulsing scanlines.
- **Cinematic Post-Processing**: Custom multi-pass post-processing pipeline pairing Three.js `UnrealBloomPass` with custom GLSL chromatic aberration, CRT scanlines, and optical vignette.
- **Reactive Web Audio Synthesizer**: Procedural dual-sawtooth drone synthesizer with dynamic low-pass filter cutoff mapping directly to CPU load, complete with high-load warning chimes and interactive user audio controls.
- **Secure Native Telemetry**: Sandboxed Electron IPC architecture continuously streams CPU usage, multi-core statistics, RAM allocation, network interfaces, and host uptime without exposing node runtime directly to renderer.
- **On-Demand Compute Benchmark**: Integrated stress-test triggering multi-million iteration mathematical calculations with synced visual aberration surge and camera warp animations.
- **Frameless Cyberpunk HUD**: Sleek translucent HUD displaying real-time FPS counters, draw calls, triangle counts, animated load bars, and in-engine diagnostic terminal logs.

---

## ✦ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Shell** | [Electron 33](https://www.electronjs.org/) (Sandboxed, Context-Isolated) |
| **3D Rendering** | [Three.js r169](https://threejs.org/) & WebGL |
| **GPGPU & Shaders** | Custom GLSL Fragment & Vertex Shaders (Simplex Noise, Curl Noise) |
| **Audio Engine** | Web Audio API (Dual Oscillators, Biquad Filter, LFO Modulation) |
| **Motion & FX** | [GSAP 3](https://greensock.com/gsap/) |
| **Build Tooling** | [electron-vite](https://electron-vite.org/) & [Vite 5](https://vitejs.dev/) |

---

## ✦ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Meet-pandya106/chronos-desktop.git
   cd chronos-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

Run the app in development mode with hot-module reloading:
```bash
npm run dev
```

### Production Build & Preview

Compile and package the application:
```bash
npm run build
npm start
```

---

## ✦ Controls & Interaction

- **Left Mouse Click + Drag**: Orbit camera around the quantum core.
- **Scroll Wheel**: Zoom in / out.
- **⚡ Button**: Trigger compute benchmark stress test.
- **🔊 / 🔇 Button**: Toggle audio drone synthesis.
- **Window Controls**: Custom frameless minimize, maximize, and close buttons.

---

## ✦ Architecture & Security

```
src/
├── main/                 # Electron main process
│   ├── index.js          # App lifecycle & BrowserWindow configuration
│   ├── ipcHandlers.js    # Window controls & benchmark IPC triggers
│   └── systemMonitor.js  # Native OS hardware telemetry sampling
├── preload/              # Secure preload bridge (contextIsolation & sandbox)
│   └── index.js          # Exposes safe window.chronosAPI
└── renderer/             # WebGL Frontend
    ├── index.html        # Frameless HUD markup
    ├── style.css         # Cyberpunk design system & animations
    └── src/
        ├── audio/        # Procedural Web Audio drone synthesizer
        ├── core/         # Engine, PostProcess & GPGPU compute controller
        ├── scene/        # Core monolith, particle field & grid floor
        ├── shaders/      # GLSL shaders (curl noise, simplex displacement, aberration)
        └── ui/           # HUD overlay, titlebar, and terminal log stream
```

---

## ✦ License

This project is licensed under the [MIT License](LICENSE).
