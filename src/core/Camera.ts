import * as THREE from "three";

export class Camera {
  private camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // fov
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near
      1000 // far
    );

    this.setupCamera();
  }

  private setupCamera(): void {
    // Position camera at center of the room for FPS exhibition view
    this.camera.position.set(0, 2, 0);
    this.camera.lookAt(0, 2, -1); // Look horizontally towards back wall
  }


  public resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public dispose(): void {
    // Nothing to dispose
  }
}
