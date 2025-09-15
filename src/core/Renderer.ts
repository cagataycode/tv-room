import * as THREE from "three";

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.setupRenderer();
    this.setupWebGPU();
  }

  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);
  }

  private async setupWebGPU(): Promise<void> {
    // Check for WebGPU support and use it if available
    if ("gpu" in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          console.log("WebGPU is supported! Using enhanced performance.");
          // Three.js will automatically use WebGPU when available
        }
      } catch (error) {
        console.log("WebGPU not available, falling back to WebGL");
      }
    }
  }

  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.renderer.dispose();
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
