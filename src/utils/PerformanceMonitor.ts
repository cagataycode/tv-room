import * as THREE from "three";

export class PerformanceMonitor {
  private stats: {
    fps: number;
    frameTime: number;
    memory: number;
    triangles: number;
    drawCalls: number;
  } = {
    fps: 0,
    frameTime: 0,
    memory: 0,
    triangles: 0,
    drawCalls: 0,
  };

  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsElement: HTMLElement | null = null;
  private memoryElement: HTMLElement | null = null;
  private trianglesElement: HTMLElement | null = null;
  private drawCallsElement: HTMLElement | null = null;

  constructor() {
    this.createStatsDisplay();
  }

  private createStatsDisplay(): void {
    const statsContainer = document.createElement("div");
    statsContainer.id = "performance-stats";
    statsContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      min-width: 150px;
    `;

    this.fpsElement = document.createElement("div");
    this.fpsElement.textContent = "FPS: 0";
    statsContainer.appendChild(this.fpsElement);

    this.memoryElement = document.createElement("div");
    this.memoryElement.textContent = "Memory: 0 MB";
    statsContainer.appendChild(this.memoryElement);

    this.trianglesElement = document.createElement("div");
    this.trianglesElement.textContent = "Triangles: 0";
    statsContainer.appendChild(this.trianglesElement);

    this.drawCallsElement = document.createElement("div");
    this.drawCallsElement.textContent = "Draw Calls: 0";
    statsContainer.appendChild(this.drawCallsElement);

    document.body.appendChild(statsContainer);
  }

  public update(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.stats.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.stats.frameTime = (currentTime - this.lastTime) / this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;

      this.updateMemoryStats();
      this.updateRenderStats(renderer, scene);
      this.updateDisplay();
    }
  }

  private updateMemoryStats(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      this.stats.memory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  }

  private updateRenderStats(
    renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene
  ): void {
    const info = renderer.info;
    this.stats.triangles = info.render.triangles;
    this.stats.drawCalls = info.render.calls;
  }

  private updateDisplay(): void {
    if (this.fpsElement) {
      this.fpsElement.textContent = `FPS: ${this.stats.fps}`;
      this.fpsElement.style.color = this.stats.fps < 30 ? "#ff6b6b" : "#4ecdc4";
    }

    if (this.memoryElement) {
      this.memoryElement.textContent = `Memory: ${this.stats.memory} MB`;
      this.memoryElement.style.color =
        this.stats.memory > 100 ? "#ff6b6b" : "#4ecdc4";
    }

    if (this.trianglesElement) {
      this.trianglesElement.textContent = `Triangles: ${this.stats.triangles.toLocaleString()}`;
    }

    if (this.drawCallsElement) {
      this.drawCallsElement.textContent = `Draw Calls: ${this.stats.drawCalls}`;
    }
  }

  public getStats() {
    return { ...this.stats };
  }

  public dispose(): void {
    const statsContainer = document.getElementById("performance-stats");
    if (statsContainer) {
      statsContainer.remove();
    }
  }
}
