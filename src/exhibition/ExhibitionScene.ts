import * as THREE from "three";
import { Scene } from "../core/Scene";
import { VintageTV } from "../objects/VintageTV";

export class ExhibitionScene extends Scene {
  private galleryObjects: THREE.Object3D[] = [];
  private floor!: THREE.Mesh;
  private walls: THREE.Mesh[] = [];
  private vintageTVs: VintageTV[] = [];

  constructor() {
    super();
    this.createGallery();
  }

  private createGallery(): void {
    this.createFloor();
    this.createWalls();
    this.addVintageTVWall();
  }

  private createFloor(): void {
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
    });

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.getScene().add(this.floor);
  }

  private createWalls(): void {
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 });
    const wallGeometry = new THREE.PlaneGeometry(15, 8);
    
    const wallConfigs = [
      { pos: [0, 4, -7.5] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
      { pos: [-7.5, 4, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
      { pos: [7.5, 4, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number] },
      { pos: [0, 4, 7.5] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
      { pos: [0, 8, 0] as [number, number, number], rot: [Math.PI / 2, 0, 0] as [number, number, number] }
    ];
    
    wallConfigs.forEach(({ pos, rot }, i) => {
      const geo = i === 4 ? new THREE.PlaneGeometry(15, 15) : wallGeometry;
      const wall = new THREE.Mesh(geo, wallMaterial);
      wall.position.set(...pos);
      wall.rotation.set(...rot);
      this.getScene().add(wall);
      this.walls.push(wall);
    });
  }

  private addVintageTVWall(): void {
    const roomSize = 15;
    const wallHeight = 8;
    const wallDepth = 7.5;

    const sizeConfigs = {
      small: { width: 0.8, height: 0.6 },
      medium: { width: 1.0, height: 0.8 },
      large: { width: 1.2, height: 0.9 },
    };

    const walls = [
      { name: "back", pos: [0, 0, -wallDepth + 0.1] as [number, number, number], rot: 0 },
      { name: "front", pos: [0, 0, wallDepth - 0.1] as [number, number, number], rot: Math.PI },
      { name: "left", pos: [-wallDepth + 0.1, 0, 0] as [number, number, number], rot: Math.PI / 2 },
      { name: "right", pos: [wallDepth - 0.1, 0, 0] as [number, number, number], rot: -Math.PI / 2 },
    ];

    const maxTVsPerWall = 10;
    const maxAttempts = 100;

    walls.forEach((wall) => {
      const placedTVs: Array<{ x: number; y: number; width: number; height: number; }> = [];
      let tvIndex = 0;
      let attempts = 0;

      while (tvIndex < maxTVsPerWall && attempts < maxAttempts) {
        attempts++;
        const sizes = ["small", "medium", "large"] as const;
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        const config = sizeConfigs[randomSize];
        let foundPosition = false;
        let bestX = 0;
        let bestY = 0;

        for (let tries = 0; tries < 50; tries++) {
          const isSideWall = wall.name === "left" || wall.name === "right";
          const x = isSideWall ? 
            Math.random() * (wallHeight - config.height) + config.height / 2 :
            (Math.random() - 0.5) * (roomSize - config.width);
          const y = isSideWall ?
            (Math.random() - 0.5) * (roomSize - config.width) :
            Math.random() * (wallHeight - config.height) + config.height / 2;

          let canPlace = true;
          for (const placedTV of placedTVs) {
            const overlapX = Math.abs(x - placedTV.x) < (config.width + placedTV.width) / 2;
            const overlapY = Math.abs(y - placedTV.y) < (config.height + placedTV.height) / 2;
            if (overlapX && overlapY) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            bestX = x;
            bestY = y;
            foundPosition = true;
            break;
          }
        }

        if (!foundPosition) continue;

        const tv = new VintageTV();
        const tvGroup = tv.getTVGroup();
        const design = tv.getDesign();
        const baseDims = { small: 1.0, medium: 1.25, large: 1.5 };
        const scale = baseDims[design.size as keyof typeof baseDims] || 1.0;
        tvGroup.scale.set(scale, scale, 1);

        const isSideWall = wall.name === "left" || wall.name === "right";
        tvGroup.position.set(
          wall.pos[0] + (isSideWall ? 0 : bestX),
          wall.pos[1] + bestX * (isSideWall ? 1 : 0) + bestY * (isSideWall ? 0 : 1),
          wall.pos[2] + (isSideWall ? bestY : 0)
        );
        tvGroup.rotation.y = wall.rot;

        this.getScene().add(tvGroup);
        this.galleryObjects.push(tvGroup);
        this.vintageTVs.push(tv);
        placedTVs.push({ x: bestX, y: bestY, width: config.width, height: config.height });
        tvIndex++;
      }
    });

    // Auto-start videos with staggered timing
    setTimeout(() => {
      this.vintageTVs.forEach((tv, index) => {
        setTimeout(() => {
          tv.playVideo();
        }, index * 200);
      });
    }, 2000);
  }

  public getVintageTVs(): VintageTV[] {
    return this.vintageTVs;
  }

  public dispose(): void {
    // Dispose of all gallery objects
    this.galleryObjects.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    // Dispose of vintage TVs
    this.vintageTVs.forEach((tv) => {
      tv.dispose();
    });

    // Clear arrays
    this.galleryObjects.length = 0;
    this.vintageTVs.length = 0;
    this.walls.length = 0;

    // Dispose of floor
    if (this.floor) {
      this.floor.geometry.dispose();
      if (Array.isArray(this.floor.material)) {
        this.floor.material.forEach((mat) => mat.dispose());
      } else {
        this.floor.material.dispose();
      }
    }

    super.dispose();
  }
}
