import * as THREE from "three";
import { Renderer } from "./core/Renderer";
import { Camera } from "./core/Camera";
import { ExhibitionScene } from "./exhibition/ExhibitionScene";
import { FPSCameraControls } from "./controls/FPSCameraControls";
import { PerformanceMonitor } from "./utils/PerformanceMonitor";
import { ModelExporter } from "./utils/ModelExporter";

export class App {
  private renderer!: Renderer;
  private camera!: Camera;
  private scene!: ExhibitionScene;
  private fpsControls!: FPSCameraControls;
  private performanceMonitor!: PerformanceMonitor;
  private container: HTMLElement;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / this.targetFPS; // 16.67ms for 60fps

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Hide loading indicator
      const loadingElement = document.getElementById("loading");
      if (loadingElement) {
        loadingElement.style.display = "none";
      }

      // Initialize core components
      this.renderer = new Renderer(this.container);
      this.camera = new Camera();
      this.scene = new ExhibitionScene();
      this.performanceMonitor = new PerformanceMonitor();

      // Setup FPS controls
      this.fpsControls = new FPSCameraControls(
        this.camera.getCamera(),
        this.renderer.getRenderer().domElement
      );

      // Set bounds for FPS movement (updated for smaller room)
      this.fpsControls.setBounds({
        minX: -7,
        maxX: 7,
        minZ: -7,
        maxZ: 7,
        minY: 1,
        maxY: 8,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Start the render loop
      this.start();

      // Initialize FPS mode display
      this.updateControlModeDisplay();

      console.log("3D Exhibition initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize 3D Exhibition:", error);
    }
  }

  private setupEventListeners(): void {
    // Window resize handler
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Keyboard controls
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    // Prevent context menu on right click
    this.container.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.camera.resize(aspect);
    this.renderer.resize(width, height);
  }

  private onKeyDown(event: KeyboardEvent): void {
    // Handle additional keyboard shortcuts
    switch (event.code) {
      case "KeyR":
        // Reset camera position
        this.resetCamera();
        break;
      case "KeyF":
        // Toggle fullscreen
        this.toggleFullscreen();
        break;
      case "KeyH":
        // Toggle help
        this.toggleHelp();
        break;
      case "KeyV":
        // Toggle video playback
        this.toggleVideo();
        break;
      case "KeyE":
        // Export TV model
        this.exportTVModel();
        break;
      case "KeyT":
        // Force update video texture
        this.forceUpdateVideoTexture();
        break;
      case "KeyD":
        // Debug TV screen
        this.debugTVScreen();
        break;
    }
  }

  private onKeyUp(_event: KeyboardEvent): void {
    // Handle key up events if needed
  }

  private resetCamera(): void {
    this.camera.getCamera().position.set(0, 2, 10);
    this.camera.getCamera().lookAt(0, 0, 0);
  }

  private updateControlModeDisplay(): void {
    const controlsElement = document.getElementById("controls");
    if (controlsElement) {
      const modeText = "FPS Mode";
      const existingMode = controlsElement.querySelector(".control-mode");

      if (existingMode) {
        existingMode.textContent = modeText;
      } else {
        const modeDiv = document.createElement("div");
        modeDiv.className = "control-mode";
        modeDiv.textContent = modeText;
        modeDiv.style.cssText = `
          font-weight: bold;
          color: #4ecdc4;
          margin-bottom: 5px;
          border-bottom: 1px solid #4ecdc4;
          padding-bottom: 5px;
        `;
        controlsElement.insertBefore(modeDiv, controlsElement.firstChild);
      }
    }
  }

  private forEachTV(action: (tv: any, index: number) => void, logMessage?: string): void {
    const tvs = this.scene.getVintageTVs();
    tvs.forEach((tv, index) => {
      action(tv, index);
      if (logMessage) console.log(logMessage.replace('{name}', tv.getDesign().name).replace('{index}', String(index + 1)));
    });
  }

  private toggleVideo(): void {
    this.forEachTV((tv) => tv.toggleVideo(), 'Toggled {name} TV {index} video');
  }

  private exportTVModel(): void {
    const tvs = this.scene.getVintageTVs();
    if (tvs.length > 0) {
      const tvWallGroup = new THREE.Group();
      tvs.forEach(tv => tvWallGroup.add(tv.getTVGroup().clone()));
      const objString = ModelExporter.exportToOBJ(tvWallGroup);
      ModelExporter.downloadOBJ(objString, "vintage_tv_wall.obj");
      console.log(`Vintage TV wall exported as vintage_tv_wall.obj (${tvs.length} TVs)`);
    }
  }

  private forceUpdateVideoTexture(): void {
    this.forEachTV((tv) => tv.forceUpdateVideoTexture(), 'Force updated video texture for {name} TV {index}');
  }

  private debugTVScreen(): void {
    this.forEachTV((tv, index) => {
      console.log(`${tv.getDesign().name} TV ${index + 1}:`);
      console.log("  Video playing:", tv.isVideoPlaying());
      console.log("  Video element:", tv.getVideoElement());
    });
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private toggleHelp(): void {
    const controlsElement = document.getElementById("controls");
    if (controlsElement) {
      controlsElement.style.display =
        controlsElement.style.display === "none" ? "block" : "none";
    }
  }

  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate(): void {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Only render if enough time has passed for target FPS
    if (deltaTime >= this.frameInterval) {
      // Update FPS controls
      this.fpsControls.update();

      // Update performance monitor
      this.performanceMonitor.update(
        this.renderer.getRenderer(),
        this.scene.getScene()
      );

      // Render the scene
      this.renderer.render(this.scene.getScene(), this.camera.getCamera());

      this.lastTime = currentTime;
    }
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
    console.log(`Target FPS set to ${fps}`);
  }

  public dispose(): void {
    this.stop();

    // Dispose of all components
    this.fpsControls.dispose();
    this.scene.dispose();
    this.camera.dispose();
    this.renderer.dispose();
    this.performanceMonitor.dispose();

    // Remove event listeners
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener("keyup", this.onKeyUp.bind(this));
  }
}
