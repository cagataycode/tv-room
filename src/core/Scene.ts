import * as THREE from "three";

export class Scene {
  private scene: THREE.Scene;
  private lights: THREE.Light[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.setupScene();
    this.setupLighting();
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(0x1a1a1a);
    this.scene.fog = new THREE.Fog(0x1a1a1a, 10, 100);
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -5);
    this.scene.add(fillLight);
    this.lights.push(fillLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);
    this.lights.push(rimLight);
  }

  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public dispose(): void {
    // Dispose of all geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }
}
